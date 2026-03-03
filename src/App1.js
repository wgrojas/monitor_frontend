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

//     // Obtener latencia por cada terminal
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

//       {/* Cards de estado */}
//       <div className="row mt-4">
//         {estado.map((item, index) => (
//           <div className="col-md-3" key={index}>
//             <div className={`card text-white ${item.estado === "UP" ? "bg-success" : "bg-danger"}`}>
//               <div className="card-body text-center">
//                 <h5>{item.texto}</h5> {/* Nombre + IP */}
//                 <h4>{item.estado}</h4>
//               </div>
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

const API = "http://localhost:5000";

function App() {
  const [estado, setEstado] = useState([]);
  const [latencias, setLatencias] = useState({});

  const cargarDatos = async () => {
    const e = await axios.get(`${API}/estado`);
    setEstado(e.data);

    // Obtener latencia por cada terminal
    const nuevasLatencias = {};
    for (const item of e.data) {
      const res = await axios.get(`${API}/latencia/${item.nombre}`);
      nuevasLatencias[item.nombre] = res.data;
    }

    setLatencias(nuevasLatencias);
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">🌐 Monitor de Redes - Tiempo Real</h2>

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
        {estado.map((item, index) => (
          <div key={index} className="d-flex flex-column align-items-center">
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                backgroundColor: item.estado === "UP" ? "#28a745" : "#dc3545",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                transition: "background-color 0.5s ease",
                textAlign: "center",
                padding: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)"
              }}
            >
              <span style={{ fontSize: "36px" }}>
                {item.estado === "UP" ? "✓" : "✕"}
              </span>
              <span style={{ fontSize: "14px", marginTop: "5px" }}>
                {item.ip}
              </span>
            </div>
            <span className="mt-2 text-center" style={{ fontWeight: "bold" }}>
              {item.nombre}
            </span>
          </div>
        ))}
      </div>

      {/* Gráficos de latencia */}
      <div className="row mt-5">
        {Object.keys(latencias).map((terminal, index) => {
          const data = latencias[terminal] || [];

          const chartData = {
            labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
            datasets: [
              {
                label: `${terminal} (ms)`,
                data: data.map(d => d.latencia),
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