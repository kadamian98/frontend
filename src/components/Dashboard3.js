import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
// eslint-disable-next-line
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = {
  ROOM: 'room',
};

const DraggableRoom = ({ room, index, moveRoom }) => {
  const [, ref] = useDrag({
    type: ItemType.ROOM,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType.ROOM,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveRoom(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <Box ref={(node) => ref(drop(node))} sx={{ padding: 1, margin: 1, border: '1px solid #000' }}>
      {room}
    </Box>
  );
};

const Dashboard3 = () => {
  const [faculties, setFaculties] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedFacultyFrom, setSelectedFacultyFrom] = useState('');
  const [selectedFacultyTo, setSelectedFacultyTo] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState({ from: [], to: [] });

  useEffect(() => {
    axios.get('/faculties').then(response => {
      setFaculties(response.data);
    });
    axios.get('/schedules').then(response => {
      setSchedules(response.data);
    });
  }, []);

  const handleFacultyFromChange = (event) => {
    setSelectedFacultyFrom(event.target.value);
  };

  const handleFacultyToChange = (event) => {
    setSelectedFacultyTo(event.target.value);
  };

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleVisualize = () => {
    const fromSchedules = schedules.filter(schedule => 
      schedule.faculty === selectedFacultyFrom && 
      schedule.day === selectedDay && 
      schedule.startTime === parseInt(selectedTime.split('-')[0])
    );
    const toSchedules = schedules.filter(schedule => 
      schedule.faculty === selectedFacultyTo && 
      schedule.day === selectedDay && 
      schedule.startTime === parseInt(selectedTime.split('-')[0])
    );
    setFilteredSchedules({ from: fromSchedules, to: toSchedules });
  };

  const moveRoom = (fromIndex, toIndex, source) => {
    const sourceList = source === 'from' ? filteredSchedules.from : filteredSchedules.to;
    const [movedItem] = sourceList.splice(fromIndex, 1);
    sourceList.splice(toIndex, 0, movedItem);

    setFilteredSchedules({
      from: source === 'from' ? sourceList : filteredSchedules.from,
      to: source === 'to' ? sourceList : filteredSchedules.to,
    });
  };

  const handleSave = () => {
    // Lógica para guardar los cambios en la base de datos
    console.log('Guardando cambios en la base de datos', filteredSchedules);
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const times = [
    { start: 700, end: 820 },
    { start: 830, end: 950 },
    { start: 1020, end: 1140 },
    { start: 1150, end: 1310 },
    { start: 1340, end: 1500 },
    { start: 1630, end: 1750 },
    { start: 1800, end: 1920 },
    { start: 1950, end: 2110 }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ padding: 2 }}>
          <Typography variant="h4" gutterBottom>
            Intercambio de Salones entre Facultades
          </Typography>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Facultad de Origen</InputLabel>
            <Select value={selectedFacultyFrom} onChange={handleFacultyFromChange}>
              {faculties.map(faculty => (
                <MenuItem key={faculty._id} value={faculty.name}>
                  {faculty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Facultad de Destino</InputLabel>
            <Select value={selectedFacultyTo} onChange={handleFacultyToChange}>
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
              {days.map(day => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Horario</InputLabel>
            <Select value={selectedTime} onChange={handleTimeChange}>
              {times.map(time => (
                <MenuItem key={time.start} value={`${time.start}-${time.end}`}>
                  {time.start}-{time.end}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleVisualize}>
            Visualizar Salones
          </Button>
        </Box>
        <Box sx={{ padding: 2 }}>
          <Typography variant="h5" gutterBottom>
            Salones de {selectedFacultyFrom} y {selectedFacultyTo}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '45%', padding: 2, border: '1px solid #ccc' }}>
              <Typography variant="h6">Facultad de Origen: {selectedFacultyFrom}</Typography>
              {filteredSchedules.from.map((schedule, index) => (
                <DraggableRoom key={schedule._id} room={schedule.room} index={index} moveRoom={(fromIndex, toIndex) => moveRoom(fromIndex, toIndex, 'from')} />
              ))}
            </Box>
            <Box sx={{ width: '45%', padding: 2, border: '1px solid #ccc' }}>
              <Typography variant="h6">Facultad de Destino: {selectedFacultyTo}</Typography>
              {filteredSchedules.to.map((schedule, index) => (
                <DraggableRoom key={schedule._id} room={schedule.room} index={index} moveRoom={(fromIndex, toIndex) => moveRoom(fromIndex, toIndex, 'to')} />
              ))}
            </Box>
          </Box>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ marginTop: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </DndProvider>
  );
};

export default Dashboard3;