import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const Dashboard3 = () => {
    const [faculties, setFaculties] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedFaculty1, setSelectedFaculty1] = useState('');
    const [selectedFaculty2, setSelectedFaculty2] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState({ start: '', end: '' });
    const [roomsFaculty1, setRoomsFaculty1] = useState([]);
    const [roomsFaculty2, setRoomsFaculty2] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [fromFaculty, setFromFaculty] = useState('');

    useEffect(() => {
        axios.get('/faculties').then(response => {
            setFaculties(response.data);
        });
        axios.get('/schedules').then(response => {
            setSchedules(response.data);
        });
    }, []);

    const handleFacultyChange1 = (event) => {
        setSelectedFaculty1(event.target.value);
    };

    const handleFacultyChange2 = (event) => {
        setSelectedFaculty2(event.target.value);
    };

    const handleDayChange = (event) => {
        setSelectedDay(event.target.value);
    };

    const handleTimeChange = (event) => {
        const { name, value } = event.target;
        setSelectedTime((prevTime) => ({ ...prevTime, [name]: value }));
    };

    const updateRooms = () => {
        const rooms1 = schedules
            .filter(schedule => schedule.faculty === selectedFaculty1 && schedule.day === selectedDay && schedule.startTime >= selectedTime.start && schedule.endTime <= selectedTime.end)
            .map(schedule => schedule.room);
        const rooms2 = schedules
            .filter(schedule => schedule.faculty === selectedFaculty2 && schedule.day === selectedDay && schedule.startTime >= selectedTime.start && schedule.endTime <= selectedTime.end)
            .map(schedule => schedule.room);

        setRoomsFaculty1(rooms1);
        setRoomsFaculty2(rooms2);
    };

    const handleRoomClick = (room, faculty) => {
        setSelectedRoom(room);
        setFromFaculty(faculty);
        setOpenDialog(true);
    };

    const handleConfirm = () => {
        if (fromFaculty === 'faculty1') {
            const newRoomsFaculty1 = roomsFaculty1.filter(room => room !== selectedRoom);
            const newRoomsFaculty2 = [...roomsFaculty2, selectedRoom];
            setRoomsFaculty1(newRoomsFaculty1);
            setRoomsFaculty2(newRoomsFaculty2);
        } else {
            const newRoomsFaculty2 = roomsFaculty2.filter(room => room !== selectedRoom);
            const newRoomsFaculty1 = [...roomsFaculty1, selectedRoom];
            setRoomsFaculty2(newRoomsFaculty2);
            setRoomsFaculty1(newRoomsFaculty1);
        }
        setOpenDialog(false);
    };

    const handleCancel = () => {
        setOpenDialog(false);
    };

    const saveChanges = () => {
        // Aquí puedes agregar la lógica para guardar los cambios en el servidor
        console.log('Cambios guardados');
        updateRooms();
    };

    const [openSaveDialog, setOpenSaveDialog] = useState(false);

    const handleSave = () => {
        setOpenSaveDialog(true);
    };

    const handleSaveConfirm = async () => {
        // Eliminar el registro anterior y crear uno nuevo en la base de datos
        const deleteSchedule = async (faculty, room) => {
            const schedule = schedules.find(s => s.faculty.name === faculty && s.room === room && s.day === selectedDay && s.startTime === selectedTime.start && s.endTime === selectedTime.end);
            if (schedule) {
                await axios.delete(`/schedules/${schedule._id}`);
            }
        };

        const createSchedule = async (faculty, room) => {
            await axios.post('/schedules', {
                faculty,
                room,
                day: selectedDay,
                startTime: selectedTime.start,
                endTime: selectedTime.end
            });
        };

        // Eliminar los horarios antiguos
        for (const room of roomsFaculty1) {
            await deleteSchedule(selectedFaculty2, room);
        }
        for (const room of roomsFaculty2) {
            await deleteSchedule(selectedFaculty1, room);
        }

        // Crear los nuevos horarios
        for (const room of roomsFaculty1) {
            await createSchedule(selectedFaculty1, room);
        }
        for (const room of roomsFaculty2) {
            await createSchedule(selectedFaculty2, room);
        }

        setOpenSaveDialog(false);
        console.log('Cambios guardados');
    };

    const handleSaveCancel = () => {
        setOpenSaveDialog(false);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ padding: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Intercambio de Salones entre Facultades
                </Typography>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel>Facultad 1</InputLabel>
                    <Select value={selectedFaculty1} onChange={handleFacultyChange1}>
                        {faculties.map(faculty => (
                            <MenuItem key={faculty._id} value={faculty.name}>
                                {faculty.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel>Facultad 2</InputLabel>
                    <Select value={selectedFaculty2} onChange={handleFacultyChange2}>
                        {faculties.map(faculty => (
                            <MenuItem key={faculty._id} value={faculty.name}>
                                {faculty.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel>Día</InputLabel>
                    <Select value={selectedDay} onChange={handleDayChange}>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                            <MenuItem key={day} value={day}>
                                {day}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel>Hora de Inicio</InputLabel>
                    <Select name="start" value={selectedTime.start} onChange={handleTimeChange}>
                        {[700, 830, 1020, 1150, 1340, 1630, 1800, 1950].map(time => (
                            <MenuItem key={time} value={time}>
                                {time}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel>Hora de Fin</InputLabel>
                    <Select name="end" value={selectedTime.end} onChange={handleTimeChange}>
                        {[820, 950, 1140, 1310, 1500, 1750, 1920, 2110].map(time => (
                            <MenuItem key={time} value={time}>
                                {time}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={updateRooms}>
                    Actualizar
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <Paper sx={{ width: '45%', padding: 2 }}>
                        <Typography variant="h6" gutterBottom>Salones de {selectedFaculty1}</Typography>
                        {roomsFaculty1.map((room, index) => (
                            <div key={index} onClick={() => handleRoomClick(room, 'faculty1')} style={{ padding: '8px', border: '1px solid gray', marginBottom: '4px', textAlign: 'center', borderRadius: '4px', backgroundColor: '#f0f0f0', cursor: 'pointer' }}>
                                {room}
                            </div>
                        ))}
                    </Paper>
                    <Paper sx={{ width: '45%', padding: 2 }}>
                        <Typography variant="h6" gutterBottom>Salones de {selectedFaculty2}</Typography>
                        {roomsFaculty2.map((room, index) => (
                            <div key={index} onClick={() => handleRoomClick(room, 'faculty2')} style={{ padding: '8px', border: '1px solid gray', marginBottom: '4px', textAlign: 'center', borderRadius: '4px', backgroundColor: '#f0f0f0', cursor: 'pointer' }}>
                                {room}
                            </div>
                        ))}
                    </Paper>
                </Box>
                <Button variant="contained" color="secondary" onClick={handleSave} sx={{ marginTop: 2 }}>
                    Guardar
                </Button>
            </Box>
            <Dialog open={openDialog} onClose={handleCancel}>
                <DialogTitle>Confirmar Intercambio</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Quiere pasar el salón {selectedRoom} a la otra facultad?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openSaveDialog} onClose={handleSaveCancel}>
                <DialogTitle>Confirmar Guardado</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Quiere guardar los cambios en la base de datos?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveCancel} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveConfirm} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Dashboard3;