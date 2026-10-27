import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Skillet.css";

const Skillet = () => {
    // Lista completa de intercambios que trae el backend
    const [intercambios, setIntercambios] = useState([]);

    // Texto que el usuario escribe en el buscador
    const [busqueda, setBusqueda] = useState("");

    // Datos del formulario (para agregar o editar)
    const [item, setItem] = useState({
        NombreEstudiante: "",
        HabilidadOfrece: "",
        HabilidadBusca: "",
        HorasDisponibles: "",
        Contacto: "",
        Estado: "Disponible",
    });

    // Indica si el modal está en modo "editar" o en modo "agregar"
    const [editing, setEditing] = useState(false);

    // ID del intercambio que se está editando
    const [itemId, setItemId] = useState(null);

    const API_URL = "http://localhost:5000/api/intercambios";

    // Al cargar la página, se piden los datos una sola vez
    useEffect(() => {
        fetchIntercambios();
    }, []);

    // Trae todos los intercambios desde el backend
    const fetchIntercambios = async () => {
        try {
            const response = await axios.get(API_URL);
            setIntercambios(response.data.empData);
        } catch (error) {
            console.log(error);
            toast.error("Error al cargar los intercambios");
        }
    };

    // Actualiza el formulario cada vez que el usuario escribe en un campo
    const handleChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    // Limpia el formulario para agregar un intercambio nuevo
    const openAddModal = () => {
        setEditing(false);
        setItemId(null);
        setItem({
            NombreEstudiante: "",
            HabilidadOfrece: "",
            HabilidadBusca: "",
            HorasDisponibles: "",
            Contacto: "",
            Estado: "Disponible",
        });
    };

    // Carga los datos de un intercambio existente en el formulario, para editarlo
    const editItem = (i) => {
        setEditing(true);
        setItemId(i.IntercambioID);
        setItem({
            NombreEstudiante: i.NombreEstudiante,
            HabilidadOfrece: i.HabilidadOfrece,
            HabilidadBusca: i.HabilidadBusca,
            HorasDisponibles: i.HorasDisponibles,
            Contacto: i.Contacto,
            Estado: i.Estado,
        });
    };

    // Guarda el formulario: crea uno nuevo o actualiza uno existente
    const saveItem = async () => {
        try {
            if (editing) {
                await axios.put(`${API_URL}/${itemId}`, item);
                toast.success("Intercambio actualizado");
            } else {
                await axios.post(API_URL, item);
                toast.success("Intercambio agregado");
            }
            fetchIntercambios();
        } catch (error) {
            console.log(error);
            toast.error("Error al guardar el intercambio");
        }
    };

    // Elimina un intercambio, con una confirmación previa
    const deleteItem = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este intercambio?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                toast.success("Intercambio eliminado");
                fetchIntercambios();
            } catch (error) {
                console.log(error);
                toast.error("Error al eliminar el intercambio");
            }
        }
    };

    // Devuelve la clase CSS según el estado, para pintar la insignia del color correcto
    const statusClass = (estado) => {
        if (estado === "Disponible") return "skillet-status--disponible";
        if (estado === "En proceso") return "skillet-status--proceso";
        return "skillet-status--completado";
    };

    // Saca las iniciales del nombre para mostrarlas en el avatar circular
    const initials = (nombre) =>
        nombre
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    // Filtra la lista según lo que el usuario escriba en el buscador
    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return intercambios;
        return intercambios.filter(
            (i) =>
                i.HabilidadOfrece.toLowerCase().includes(q) ||
                i.HabilidadBusca.toLowerCase().includes(q) ||
                i.NombreEstudiante.toLowerCase().includes(q)
        );
    }, [busqueda, intercambios]);

    // Cuenta cuántos intercambios están en estado "Disponible"
    const disponibles = intercambios.filter((i) => i.Estado === "Disponible").length;

    return (
        <div className="skillet-app">
            <ToastContainer />

            {/* Encabezado con el nombre, la descripción y las estadísticas */}
            <header className="skillet-hero">
                <div className="skillet-hero-inner">
                    <h1 className="skillet-wordmark">Skillet</h1>
                    <p className="skillet-tagline">
                        Banco de tiempo estudiantil: intercambia lo que sabes por lo que
                        necesitas aprender, sin que el dinero entre en la ecuación.
                    </p>
                    <div className="skillet-stats">
                        <div>
                            <div className="skillet-stat-value">{intercambios.length}</div>
                            <div className="skillet-stat-label">Intercambios registrados</div>
                        </div>
                        <div>
                            <div className="skillet-stat-value">{disponibles}</div>
                            <div className="skillet-stat-label">Disponibles ahora</div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="skillet-body">
                {/* Barra con el buscador y el botón de agregar */}
                <div className="skillet-toolbar">
                    <input
                        className="skillet-search"
                        placeholder="Buscar por habilidad o nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button
                        className="skillet-add-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#itemModal"
                        onClick={openAddModal}
                    >
                        + Agregar intercambio
                    </button>
                </div>

                {/* Si no hay resultados, se muestra un mensaje en vez de una cuadrícula vacía */}
                {filtrados.length === 0 ? (
                    <div className="skillet-empty">
                        <div className="skillet-empty-title">
                            {intercambios.length === 0
                                ? "Todavía no hay intercambios"
                                : "Nada coincide con esa búsqueda"}
                        </div>
                        <p className="skillet-empty-text">
                            {intercambios.length === 0
                                ? "Sé el primero en registrar qué sabes y qué te gustaría aprender."
                                : "Prueba con otra habilidad o borra el filtro."}
                        </p>
                    </div>
                ) : (
                    // Cuadrícula de tarjetas, una por cada intercambio
                    <div className="skillet-grid">
                        {filtrados.map((i) => (
                            <article className="skillet-card" key={i.IntercambioID}>
                                <div className="skillet-card-head">
                                    <div className="skillet-avatar">
                                        {initials(i.NombreEstudiante)}
                                    </div>
                                    <div>
                                        <div className="skillet-name">{i.NombreEstudiante}</div>
                                        <div className="skillet-contact">{i.Contacto}</div>
                                    </div>
                                </div>

                                <div className="skillet-tags">
                                    <div className="skillet-tag-row">
                                        <span className="skillet-tag-label">OFRECE</span>
                                        <span className="skillet-tag-offer">{i.HabilidadOfrece}</span>
                                    </div>
                                    <div className="skillet-tag-row">
                                        <span className="skillet-tag-label">BUSCA</span>
                                        <span className="skillet-tag-want">{i.HabilidadBusca}</span>
                                    </div>
                                </div>

                                <div className="skillet-meta-row">
                                    <span className="skillet-hours">
                                        {i.HorasDisponibles} {i.HorasDisponibles === 1 ? "hora" : "horas"} disponibles
                                    </span>
                                    <span className={`skillet-status ${statusClass(i.Estado)}`}>
                                        <span className="skillet-status-dot"></span>
                                        {i.Estado}
                                    </span>
                                </div>

                                <div className="skillet-actions">
                                    <button
                                        className="skillet-icon-btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#itemModal"
                                        onClick={() => editItem(i)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="skillet-icon-btn skillet-icon-btn--danger"
                                        onClick={() => deleteItem(i.IntercambioID)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal para agregar o editar un intercambio */}
            <div className="modal fade skillet-modal" id="itemModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {editing ? "Editar intercambio" : "Agregar intercambio"}
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <input
                                className="form-control mb-2"
                                name="NombreEstudiante"
                                placeholder="Nombre del estudiante"
                                value={item.NombreEstudiante}
                                onChange={handleChange}
                            />
                            <input
                                className="form-control mb-2"
                                name="HabilidadOfrece"
                                placeholder="¿Qué habilidad ofreces?"
                                value={item.HabilidadOfrece}
                                onChange={handleChange}
                            />
                            <input
                                className="form-control mb-2"
                                name="HabilidadBusca"
                                placeholder="¿Qué habilidad buscas?"
                                value={item.HabilidadBusca}
                                onChange={handleChange}
                            />
                            <input
                                className="form-control mb-2"
                                name="HorasDisponibles"
                                type="number"
                                placeholder="Horas disponibles"
                                value={item.HorasDisponibles}
                                onChange={handleChange}
                            />
                            <input
                                className="form-control mb-2"
                                name="Contacto"
                                placeholder="Correo o celular"
                                value={item.Contacto}
                                onChange={handleChange}
                            />
                            <select
                                className="form-control mb-2"
                                name="Estado"
                                value={item.Estado}
                                onChange={handleChange}
                            >
                                <option value="Disponible">Disponible</option>
                                <option value="En proceso">En proceso</option>
                                <option value="Completado">Completado</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={saveItem}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skillet;