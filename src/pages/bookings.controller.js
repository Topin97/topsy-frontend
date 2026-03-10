const { supabaseAdmin } = require('../config/supabase');

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Checks if a time slot is available for a professional.
 * Returns true if available, false if conflicting booking exists.
 */
const isSlotAvailable = async (professionalId, startsAt, endsAt, excludeBookingId = null) => {
  let query = supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('professional_id', professionalId)
    .in('status', ['pending', 'confirmed'])
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt);

  if (excludeBookingId) query = query.neq('id', excludeBookingId);

  const { data } = await query;
  return data?.length === 0;
};

/**
 * Checks if datetime falls within professional's weekly availability.
 */
const isWithinAvailability = async (professionalId, startsAt, endsAt) => {
  const date = new Date(startsAt);
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const dayName = days[date.getDay()];
  const startTime = date.toTimeString().slice(0, 5);       // "HH:MM"
  const endTime = new Date(endsAt).toTimeString().slice(0, 5);

  const { data } = await supabaseAdmin
    .from('availability')
    .select('start_time, end_time')
    .eq('professional_id', professionalId)
    .eq('day_of_week', dayName)
    .eq('is_available', true)
    .single();

  if (!data) return false;
  return startTime >= data.start_time && endTime <= data.end_time;
};

// ────────────────────────────────────────────────────────────────
// GET /api/bookings/available-slots?professional_id=&service_id=&date=
// Returns free time slots for a given professional on a given date
// ────────────────────────────────────────────────────────────────
const getAvailableSlots = async (req, res) => {
  try {
    const { professional_id, service_id, date } = req.query;

    if (!professional_id || !service_id || !date) {
      return res.status(400).json({ error: 'professional_id, service_id y date son requeridos' });
    }

    // Get service duration
    const { data: service, error: sErr } = await supabaseAdmin
      .from('services')
      .select('duration_minutes')
      .eq('id', service_id)
      .single();

    if (sErr || !service) return res.status(404).json({ error: 'Servicio no encontrado' });

    const duration = service.duration_minutes;
    const requestedDate = new Date(date);
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dayName = days[requestedDate.getDay()];

    // Get availability for that day
    const { data: avail } = await supabaseAdmin
      .from('availability')
      .select('start_time, end_time')
      .eq('professional_id', professional_id)
      .eq('day_of_week', dayName)
      .eq('is_available', true)
      .single();

    if (!avail) {
      return res.json({ data: [], message: 'El profesional no trabaja ese día' });
    }

    // Get existing bookings for that day
    const dayStart = new Date(date + 'T00:00:00.000Z');
    const dayEnd   = new Date(date + 'T23:59:59.999Z');

    const { data: existingBookings } = await supabaseAdmin
      .from('bookings')
      .select('starts_at, ends_at')
      .eq('professional_id', professional_id)
      .in('status', ['pending', 'confirmed'])
      .gte('starts_at', dayStart.toISOString())
      .lte('ends_at',   dayEnd.toISOString());

    // Generate slots every `duration` minutes between avail window
    const slots = [];
    const [sh, sm] = avail.start_time.split(':').map(Number);
    const [eh, em] = avail.end_time.split(':').map(Number);

    let cursor = new Date(date);
    cursor.setUTCHours(sh, sm, 0, 0);

    const windowEnd = new Date(date);
    windowEnd.setUTCHours(eh, em, 0, 0);

    while (cursor < windowEnd) {
      const slotEnd = new Date(cursor.getTime() + duration * 60000);
      if (slotEnd > windowEnd) break;

      const hasConflict = existingBookings?.some(b =>
        new Date(b.starts_at) < slotEnd && new Date(b.ends_at) > cursor
      );

      slots.push({
        starts_at: cursor.toISOString(),
        ends_at:   slotEnd.toISOString(),
        available: !hasConflict,
      });

      cursor = new Date(cursor.getTime() + duration * 60000);
    }

    res.json({ data: slots });
  } catch (err) {
    console.error('[Bookings] getAvailableSlots:', err.message);
    res.status(500).json({ error: 'Error al obtener slots disponibles' });
  }
};

// ────────────────────────────────────────────────────────────────
// POST /api/bookings
// ────────────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { professional_id, service_id, starts_at, notes } = req.body;

    // Validate service belongs to professional and is active
    const { data: service, error: sErr } = await supabaseAdmin
      .from('services')
      .select('id, name, price, duration_minutes, professional_id')
      .eq('id', service_id)
      .eq('professional_id', professional_id)
      .eq('is_active', true)
      .single();

    if (sErr || !service) {
      return res.status(404).json({ error: 'Servicio no disponible' });
    }

    const endsAt = new Date(
      new Date(starts_at).getTime() + service.duration_minutes * 60000
    ).toISOString();

    // Validate availability window
    const withinWindow = await isWithinAvailability(professional_id, starts_at, endsAt);
    if (!withinWindow) {
      return res.status(422).json({ error: 'El horario está fuera de la disponibilidad del profesional' });
    }

    // Check slot is free
    const slotFree = await isSlotAvailable(professional_id, starts_at, endsAt);
    if (!slotFree) {
      return res.status(409).json({ error: 'Este horario ya no está disponible' });
    }

    // Create booking
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        client_id:       req.user.id,
        professional_id,
        service_id,
        status:          'confirmed',
        starts_at,
        ends_at:         endsAt,
        total_price:     service.price,
        notes,
      })
      .select(`
        *,
        services(name, price, duration_minutes),
        professional_profiles(business_name, address, city,
          profiles!inner(full_name, phone)
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      message: '¡Cita confirmada!',
      data,
    });
  } catch (err) {
    console.error('[Bookings] create:', err.message);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

// ────────────────────────────────────────────────────────────────
// GET /api/bookings/my  (client's own bookings)
// ────────────────────────────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        services(name, price, duration_minutes),
        professional_profiles(
          id, business_name, address, city, cover_image_url,
          profiles!inner(full_name)
        )
      `)
      .eq('client_id', req.user.id)
      .order('starts_at', { ascending: false });

    if (status)   query = query.eq('status', status);
    if (upcoming === 'true') query = query.gt('starts_at', new Date().toISOString()).in('status', ['pending','confirmed']);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data });
  } catch (err) {
    console.error('[Bookings] getMyBookings:', err.message);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// ────────────────────────────────────────────────────────────────
// GET /api/bookings/professional  (professional sees their bookings)
// ────────────────────────────────────────────────────────────────
const getProfessionalBookings = async (req, res) => {
  try {
    const { status, date } = req.query;

    const { data: profile } = await supabaseAdmin
      .from('professional_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        services(name, price, duration_minutes),
        profiles!client_id(full_name, phone, avatar_url)
      `)
      .eq('professional_id', profile.id)
      .order('starts_at', { ascending: true });

    if (status) query = query.eq('status', status);

    if (date) {
      const start = new Date(date + 'T00:00:00.000Z').toISOString();
      const end   = new Date(date + 'T23:59:59.999Z').toISOString();
      query = query.gte('starts_at', start).lte('starts_at', end);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ data });
  } catch (err) {
    console.error('[Bookings] getProfessionalBookings:', err.message);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// ────────────────────────────────────────────────────────────────
// PATCH /api/bookings/:id/cancel
// ────────────────────────────────────────────────────────────────
const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Fetch booking to verify ownership and status
    const { data: booking, error: bErr } = await supabaseAdmin
      .from('bookings')
      .select('id, client_id, status, starts_at, professional_id')
      .eq('id', id)
      .single();

    if (bErr || !booking) return res.status(404).json({ error: 'Reserva no encontrada' });

    // Only client or the professional can cancel
    const isClient = booking.client_id === req.user.id;
    const { data: proProfile } = await supabaseAdmin
      .from('professional_profiles')
      .select('id, user_id')
      .eq('id', booking.professional_id)
      .single();
    const isProfessional = proProfile?.user_id === req.user.id;

    if (!isClient && !isProfessional) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
    }

    if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
      return res.status(422).json({ error: `No se puede cancelar una reserva en estado: ${booking.status}` });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status:              'cancelled',
        cancellation_reason: reason ?? null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Reserva cancelada', data });
  } catch (err) {
    console.error('[Bookings] cancel:', err.message);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
};

// ────────────────────────────────────────────────────────────────
// PATCH /api/bookings/:id/complete
// ────────────────────────────────────────────────────────────────
const complete = async (req, res) => {
  try {
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('id, status, professional_id, professional_profiles!inner(user_id)')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !booking) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (booking.professional_profiles.user_id !== req.user.id)
      return res.status(403).json({ error: 'No tienes permiso' });
    if (booking.status !== 'confirmed')
      return res.status(422).json({ error: 'Solo se pueden completar reservas confirmadas' });

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Reserva completada', data });
  } catch (err) {
    console.error('[Bookings] complete:', err.message);
    res.status(500).json({ error: 'Error al completar reserva' });
  }
};

// POST /api/bookings/:id/review
// ────────────────────────────────────────────────────────────────
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('id, client_id, professional_id, status')
      .eq('id', id)
      .single();

    if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (booking.client_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });
    if (booking.status !== 'completed') return res.status(422).json({ error: 'Solo puedes valorar reservas completadas' });

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id:      id,
        client_id:       req.user.id,
        professional_id: booking.professional_id,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Ya valoraste esta reserva' });
      throw error;
    }

    res.status(201).json({ message: 'Valoración enviada. ¡Gracias!', data });
  } catch (err) {
    console.error('[Bookings] addReview:', err.message);
    res.status(500).json({ error: 'Error al enviar valoración' });
  }
};

module.exports = {
  getAvailableSlots,
  create,
  getMyBookings,
  getProfessionalBookings,
  complete,
  cancel,
  addReview,
  reschedule,
  addNote,
};

// ────────────────────────────────────────────────────────────────
// PATCH /api/bookings/:id/reschedule  (professional only)
// Body: { starts_at: ISO string }
// ────────────────────────────────────────────────────────────────
const reschedule = async (req, res) => {
  try {
    const { starts_at } = req.body;
    if (!starts_at) return res.status(400).json({ error: 'starts_at requerido' });

    // Load booking + service duration
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('id, status, professional_id, service_id, professional_profiles!inner(user_id), services!inner(duration_minutes)')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !booking) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (booking.professional_profiles.user_id !== req.user.id)
      return res.status(403).json({ error: 'Solo el profesional puede reprogramar' });
    if (['cancelled', 'completed', 'no_show'].includes(booking.status))
      return res.status(422).json({ error: 'No se puede reprogramar esta reserva' });

    const newStart = new Date(starts_at);
    const newEnd   = new Date(newStart.getTime() + booking.services.duration_minutes * 60000);

    // Check no conflict with other bookings (exclude self)
    const { data: conflicts } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('professional_id', booking.professional_id)
      .in('status', ['pending', 'confirmed'])
      .neq('id', req.params.id)
      .lt('starts_at', newEnd.toISOString())
      .gt('ends_at',   newStart.toISOString());

    if (conflicts?.length > 0)
      return res.status(409).json({ error: 'Ya hay otra reserva en ese horario' });

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ starts_at: newStart.toISOString(), ends_at: newEnd.toISOString(), status: 'confirmed' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Reserva reprogramada', data });
  } catch (err) {
    console.error('[Bookings] reschedule:', err.message);
    res.status(500).json({ error: 'Error al reprogramar' });
  }
};

// ────────────────────────────────────────────────────────────────
// PATCH /api/bookings/:id/note  (client or professional)
// Body: { note: string }
// ────────────────────────────────────────────────────────────────
const addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return res.status(400).json({ error: 'note requerido' });

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('id, client_id, professional_id, notes, professional_profiles!inner(user_id)')
      .eq('id', req.params.id)
      .single();

    if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });

    const isClient = booking.client_id === req.user.id;
    const isPro    = booking.professional_profiles.user_id === req.user.id;
    if (!isClient && !isPro) return res.status(403).json({ error: 'No autorizado' });

    // Append note with author tag and timestamp
    const role      = isClient ? 'Cliente' : 'Profesional';
    const timestamp = new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const separator = booking.notes ? '\n---\n' : '';
    const newNotes  = `${booking.notes ?? ''}${separator}[${role} · ${timestamp}]\n${note.trim()}`;

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ notes: newNotes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Nota añadida', data });
  } catch (err) {
    console.error('[Bookings] addNote:', err.message);
    res.status(500).json({ error: 'Error al añadir nota' });
  }
};
