const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sql, poolPromise } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

// Listar todos los intercambios
app.get('/api/intercambios', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM BancoTiempo');
        res.status(200).json({ success: true, empData: result.recordset });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error, intenta de nuevo", error: err.message });
    }
});

// Obtener un intercambio por ID
app.get('/api/intercambios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: "El ID debe ser un número" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('IntercambioID', sql.Int, id)
            .query('SELECT * FROM BancoTiempo WHERE IntercambioID = @IntercambioID');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Intercambio no encontrado" });
        }

        res.status(200).json({ success: true, empData: result.recordset[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error, intenta de nuevo", error: err.message });
    }
});

// Crear un nuevo intercambio
app.post('/api/intercambios', async (req, res) => {
    try {
        const { NombreEstudiante, HabilidadOfrece, HabilidadBusca, HorasDisponibles, Contacto, Estado } = req.body;

        if (!NombreEstudiante || !HabilidadOfrece || !HabilidadBusca || !HorasDisponibles || !Contacto) {
            return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('NombreEstudiante', sql.VarChar, NombreEstudiante)
            .input('HabilidadOfrece', sql.VarChar, HabilidadOfrece)
            .input('HabilidadBusca', sql.VarChar, HabilidadBusca)
            .input('HorasDisponibles', sql.Int, HorasDisponibles)
            .input('Contacto', sql.VarChar, Contacto)
            .input('Estado', sql.VarChar, Estado || 'Disponible')
            .query(`INSERT INTO BancoTiempo (NombreEstudiante, HabilidadOfrece, HabilidadBusca, HorasDisponibles, Contacto, Estado)
                    VALUES (@NombreEstudiante, @HabilidadOfrece, @HabilidadBusca, @HorasDisponibles, @Contacto, @Estado)`);

        res.status(200).json({ success: true, rowsAffected: result.rowsAffected });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error, intenta de nuevo", error: err.message });
    }
});

// Actualizar un intercambio existente
app.put('/api/intercambios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { NombreEstudiante, HabilidadOfrece, HabilidadBusca, HorasDisponibles, Contacto, Estado } = req.body;

        if (!NombreEstudiante || !HabilidadOfrece || !HabilidadBusca || !HorasDisponibles || !Contacto) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('IntercambioID', sql.Int, id)
            .input('NombreEstudiante', sql.VarChar, NombreEstudiante)
            .input('HabilidadOfrece', sql.VarChar, HabilidadOfrece)
            .input('HabilidadBusca', sql.VarChar, HabilidadBusca)
            .input('HorasDisponibles', sql.Int, HorasDisponibles)
            .input('Contacto', sql.VarChar, Contacto)
            .input('Estado', sql.VarChar, Estado)
            .query(`UPDATE BancoTiempo
                    SET NombreEstudiante = @NombreEstudiante,
                        HabilidadOfrece = @HabilidadOfrece,
                        HabilidadBusca = @HabilidadBusca,
                        HorasDisponibles = @HorasDisponibles,
                        Contacto = @Contacto,
                        Estado = @Estado
                    WHERE IntercambioID = @IntercambioID`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Intercambio no encontrado' });
        }

        res.status(200).json({ success: true, rowsAffected: result.rowsAffected });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Eliminar un intercambio existente
app.delete('/api/intercambios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: "El ID debe ser un número" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('IntercambioID', sql.Int, id)
            .query('DELETE FROM BancoTiempo WHERE IntercambioID = @IntercambioID');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: "Intercambio no encontrado" });
        }

        res.status(200).json({ success: true, rowsAffected: result.rowsAffected });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
});