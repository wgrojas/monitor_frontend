// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import "bootstrap/dist/css/bootstrap.min.css";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const API = "http://localhost:5000";

// function App() {
//   const [estado, setEstado] = useState([]);
//   const [latencias, setLatencias] = useState({});

//   const cargarDatos = async () => {
//     const e = await axios.get(`${API}/estado`);
//     setEstado(e.data);

//     const nuevasLatencias = {};
//     for (const item of e.data) {
//       const res = await axios.get(`${API}/latencia/${item.nombre}`);
//       nuevasLatencias[item.nombre] = res.data;
//     }

//     setLatencias(nuevasLatencias);
//   };

//   useEffect(() => {
//     cargarDatos();
//     const interval = setInterval(cargarDatos, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center">🌐 Monitor de Redes - Tiempo Real</h2>

//       {/* Indicadores de estado como círculos grandes alineados */}
//       <div
//         className="mt-4"
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
//           justifyItems: "center",
//           gap: "20px"
//         }}
//       >
//         {estado.map((item, index) => (
//           <div key={index} className="d-flex flex-column align-items-center">
//             <div
//               style={{
//                 width: "160px",
//                 height: "160px",
//                 borderRadius: "50%",
//                 backgroundColor: item.estado === "UP" ? "#28a745" : "#dc3545",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "white",
//                 fontWeight: "bold",
//                 fontSize: "14px",
//                 transition: "background-color 0.5s ease",
//                 textAlign: "center",
//                 padding: "10px",
//                 boxShadow: "0 0 10px rgba(0,0,0,0.2)"
//               }}
//             >
//               {/* Estado */}
//               {/* <span style={{ fontSize: "36px" }}>
//                 {item.estado === "UP" ? "✓" : "✕"}
//               </span> */}

//               {/* Nombre de la terminal */}
//               <span style={{ fontSize: "14px", marginTop: "5px", fontWeight: "bold" }}>
//                 {item.nombre}
//               </span>

//               {/* IP */}
//               <span style={{ fontSize: "12px", marginTop: "3px" }}>
//                 {item.ip}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Gráficos de latencia */}
//       <div className="row mt-5">
//         {Object.keys(latencias).map((terminal, index) => {
//           const data = latencias[terminal] || [];

//           const chartData = {
//             labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
//             datasets: [
//               {
//                 label: `${terminal} (ms)`,
//                 data: data.map(d => d.latencia),
//                 borderColor: "blue",
//                 backgroundColor: "rgba(0,0,255,0.2)",
//                 tension: 0.4
//               }
//             ]
//           };

//           return (
//             <div className="col-md-6 mb-4" key={index}>
//               <h5>{terminal} - Latencia en Tiempo Real</h5>
//               <Line data={chartData} />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default App;

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

// const API = "http://localhost:5000";
const API ="https://netmonitor-c0b3d8c31833.herokuapp.com"

// Terminales por defecto si no hay conexión
const TERMINALES_DEFAULT = [
  { nombre: "Terminal Giron canal 1", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "Terminal Giron canal 2", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "Bodega Giron canal 1", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "Bodega Giron canal 2", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "San Andres", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "Terminal Cucuta canal 1", ip: "", estado: "NO CONEXIÓN" },
  { nombre: "Terminal Cucuta canal 2", ip: "", estado: "NO CONEXIÓN" }
];

function App() {
  const [estado, setEstado] = useState([]);
  const [latencias, setLatencias] = useState({});
  const [conexionOk, setConexionOk] = useState(true); // Para mostrar mensaje de conexión

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
          nuevasLatencias[item.nombre] = res.data;
        } catch {
          nuevasLatencias[item.nombre] = [];
        }
      }
      setLatencias(nuevasLatencias);
    } catch (error) {
      // Si falla la conexión al backend
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
      <h2 className="text-center">🌐 Monitor de Redes - Tiempo Real</h2>

      {/* Mensaje de conexión */}
      {!conexionOk && (
        <div className="text-center mt-2 mb-4" style={{ color: "#dc3545", fontWeight: "bold" }}>
          ⚠️ No hay conexión con el servidor
        </div>
      )}

      {/* Indicadores de estado como círculos grandes alineados */}
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
          // Color según estado
          let color;
          if (item.estado === "UP") color = "#28a745";
          else if (item.estado === "DOWN") color = "#dc3545";
          else color = "#c0c0c0"; // gris claro para NO CONEXIÓN

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
                  transition: "background-color 0.5s ease",
                  textAlign: "center",
                  padding: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)"
                }}
              >
                {/* Nombre de la terminal */}
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {item.nombre}
                </span>
                {/* IP */}
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

          if (data.length === 0) return null; // No mostrar gráfico si no hay datos

          const chartData = {
            labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
            datasets: [
              {
                label: `${terminal} (ms)`,
                data: data.map((d) => d.latencia),
                borderColor: "blue",
                backgroundColor: "rgba(0,0,255,0.2)",
                tension: 0.4
              }
            ]
          };

          return (
            <div className="col-md-6 mb-4" key={index}>
              <h5>{terminal} - Latencia en Tiempo Real</h5>
              <Line data={chartData} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;