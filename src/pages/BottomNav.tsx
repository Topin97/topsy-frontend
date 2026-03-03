import { Home, CalendarDays, User, Search } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const Item = ({
    icon: Icon,
    label,
    path
  }: {
    icon: any
    label: string
    path: string
  }) => {
    const active = isActive(path)

    return (
      <button
        onClick={() => navigate(path)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: active ? "#C9965A" : "#F7F2EA",
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          transition: "all 0.2s ease"
        }}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
        {label}
      </button>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: "#12100D",
        borderTop: "1px solid rgba(201,150,90,0.2)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backdropFilter: "blur(10px)",
        zIndex: 1000
      }}
    >
      <Item icon={Home} label="Inicio" path="/" />
      <Item icon={Search} label="Buscar" path="/buscar" />
      <Item icon={CalendarDays} label="Reservas" path="/reservas" />
      <Item icon={User} label="Perfil" path="/perfil" />
    </div>
  )
}