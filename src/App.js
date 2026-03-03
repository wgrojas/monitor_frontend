import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

 const API  =  "https://monitor-backend-3425c25c5e0a.herokuapp.com"//Proyecto montado en Git

//const API = "https://netmonitor-76a5279b8bdd.herokuapp.com"; // Cambia aquí si tu backend tiene otra URL
const MAX_LATENCIAS = 20;

// Terminales por defecto si no hay conexión
const TERMINALES_DEFAULT = [
  { nombre: "", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "", ip: "", estado: "NO CONEXIÓN" },
  
];

function App() {
  const [estado, setEstado] = useState([]);
  const [latencias, setLatencias] = useState({});
  const [conexionOk, setConexionOk] = useState(true);

  const cargarDatos = async () => {
    try {
      const e = await axios.get(`${API}/estado`);
      setEstado(e.data);
      setConexionOk(true);

      // Obtener latencia por cada terminal
      const nuevasLatencias = {};
      for (const item of e.data) {
        try {
          const res = await axios.get(`${API}/latencia/${item.nombre}`);
          nuevasLatencias[item.nombre] = Array.isArray(res.data)
            ? res.data.slice(-MAX_LATENCIAS)
            : [];
        } catch (error) {
          // Mostrar error de cada terminal
          console.error(`Error cargando latencia de ${item.nombre}:`, error);
          nuevasLatencias[item.nombre] = [];
        }
      }
      setLatencias(nuevasLatencias);

    } catch (error) {
      // Mostrar error de conexión general al backend
      console.error("Error cargando datos del backend:", error);
      setEstado(TERMINALES_DEFAULT);
      setLatencias({});
      setConexionOk(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">🌐 Monitor de Redes Wilmar- Tiempo Real</h2>

      {/* Mensaje de conexión */}
      {!conexionOk && (
        <div
          className="text-center mt-2 mb-4"
          style={{ color: "#dc3545", fontWeight: "bold" }}
        >
          ⚠️ No hay conexión con el servidor
        </div>
      )}

      {/* Indicadores de estado */}
      <div
        className="mt-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          justifyItems: "center",
          gap: "20px"
        }}
      >
        {estado.map((item, index) => {
          let color;
          if (item.estado === "UP") color = "#28a745";
          else if (item.estado === "DOWN") color = "#dc3545";
          else color = "#c0c0c0"; // gris claro

          return (
            <div key={index} className="d-flex flex-column align-items-center">
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "background-color 0.5s ease, transform 0.3s ease",
                  textAlign: "center",
                  padding: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                  cursor: "pointer"
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                title={`IP: ${item.ip || "N/A"}`}
              >
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {item.nombre}
                </span>
                <span style={{ fontSize: "12px", marginTop: "3px" }}>
                  {item.ip || ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos de latencia */}
      <div className="row mt-5">
        {Object.keys(latencias).map((terminal, index) => {
          const data = latencias[terminal] || [];

          if (data.length === 0)
            return (
              <div className="col-md-6 mb-4" key={index}>
                <h5>{terminal} - Latencia en Tiempo Real</h5>
                <p>Sin datos disponibles</p>
              </div>
            );

          const chartData = {
            labels: data.map(d => {
              const fechaUTC = new Date(d.timestamp + "Z"); // Forzar UTC
              return fechaUTC.toLocaleTimeString("es-CO", {
                timeZone: "America/Bogota",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              });
            }),
            datasets: [
              {
                label: `${terminal} (ms)`,
                data: data.map(d => d.latencia),
                borderColor: "#007bff",
                backgroundColor: "rgba(0,123,255,0.2)",
                tension: 0.3,
                fill: true
              }
            ]
          };

          return (
            <div className="col-md-6 mb-4" key={index}>
              <h5>{terminal} - Latencia en Tiempo Real</h5>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: ctx => {
                          const ip =
                            estado.find(e => e.nombre === terminal)?.ip || "";
                          return `Latencia: ${ctx.raw} ms - IP: ${ip}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Latencia (ms)" }
                    },
                    x: {
                      title: { display: true, text: "Hora (Colombia)" }
                    }
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;