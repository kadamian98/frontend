import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// eslint-disable-next-line
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, Card, CardContent, Grid, Avatar, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
// eslint-disable-next-line
import MenuIcon from '@mui/icons-material/Menu';

const facultyColors = {
  'Ingeniería': 'gray',
  'Humanidades': 'lightblue',
  'Económicas': 'orange',
  'Salud': 'Palevioletred',
  'Políticas': 'maroon',
  'Jurídicas': 'red',
  'Arquitectura': 'gold',
  'Ambientales': 'green',
  'Teología': 'Saddlebrown'
};

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Dashboard1 = () => {
  const [faculties, setFaculties] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  useEffect(() => {
    axios.get('/faculties').then(response => {
      console.log('Faculties:', response.data);
      setFaculties(response.data);
    });
    axios.get('/schedules').then(response => {
      console.log('Schedules:', response.data);
      setSchedules(response.data);
    });
    axios.get('/rooms').then(response => {
      console.log('Rooms:', response.data);
      setRooms(response.data);
    });
  }, []);

  const handleDrop = (item, monitor, day, startTime, endTime, room) => {
    const existingSchedule = schedules.find(schedule => schedule.room === room.name && schedule.day === day && schedule.startTime === startTime);
    if (existingSchedule) {
      setSnackbarOpen(true);
    } else {
      const faculty = faculties.find(f => f._id === item.id);
      const newSchedule = {
        faculty: faculty.name,
        room: room.name,
        day,
        startTime,
        endTime
      };
      setSelectedSchedule(newSchedule);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSchedule(null);
  };

  const handleConfirm = () => {
    if (selectedSchedule) {
      axios.post('/schedules', selectedSchedule).then(response => {
        setSchedules([...schedules, response.data]);
        handleClose();
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scheduleToDelete) {
      axios.delete(`/schedules/${scheduleToDelete._id}`).then(() => {
        setSchedules(schedules.filter(schedule => schedule._id !== scheduleToDelete._id));
        setDeleteConfirmOpen(false);
        setScheduleToDelete(null);
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setScheduleToDelete(null);
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
            Asignación de Salones
          </Typography>
          <Grid container spacing={1} sx={{ marginBottom: 1 }}>
            {faculties.map(faculty => (
              <Grid item xs={6} sm={3} md={1} key={faculty._id}>
                <Faculty faculty={faculty} />
              </Grid>
            ))}
          </Grid>
          <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Salón (Capacidad)</TableCell>
                  {days.map((day, index) => (
                    <React.Fragment key={day}>
                      {times.map(time => (
                        <TableCell key={`${day}-${time.start}`}>{day} {time.start}-{time.end}</TableCell>
                      ))}
                      {index < days.length - 1 && <TableCell sx={{ borderLeft: '4px solid black', minWidth: '4px' }}></TableCell>}
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map(room => (
                  <TableRow key={room._id}>
                    <TableCell>{room.name} ({room.capacity})</TableCell>
                    {days.map((day, index) => (
                      <React.Fragment key={day}>
                        {times.map(time => (
                          <TableCell key={`${room._id}-${day}-${time.start}`} sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                            <Room
                              room={room}
                              day={day}
                              startTime={time.start}
                              endTime={time.end}
                              onDrop={handleDrop}
                            />
                            {schedules
                              .filter(schedule => schedule.room === room.name && schedule.day === day && schedule.startTime === time.start)
                              .map(schedule => (
                                <Box key={schedule._id} sx={{ backgroundColor: facultyColors[schedule.faculty], padding: '5px', borderRadius: '5px', textAlign: 'center', color: 'white', position: 'relative' }}>
                                  {schedule.faculty}
                                  <IconButton
                                    size="small"
                                    sx={{ position: 'absolute', top: 0, right: 0, color: 'white' }}
                                    onClick={() => handleDeleteClick(schedule)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              ))}
                          </TableCell>
                        ))}
                        {index < days.length - 1 && <TableCell sx={{ borderLeft: '4px solid black', minWidth: '4px' }}></TableCell>}
                      </React.Fragment>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Confirmar Asignación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas asignar esta facultad a este horario y salón?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar esta asignación?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
            Esta celda ya está ocupada. No se puede asignar otra facultad.
          </Alert>
        </Snackbar>
      </Box>
    </DndProvider>
  );
};
const Faculty = ({ faculty }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FACULTY',
    item: { id: faculty._id },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <StyledCard ref={drag} sx={{ opacity: isDragging ? 0.5 : 1, backgroundColor: facultyColors[faculty.name], color: 'white', cursor: 'pointer' }}>
      <CardContent>
        <Typography variant="h10" component="div">
          {faculty.name}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

const Room = ({ room, day, startTime, endTime, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FACULTY',
    drop: (item, monitor) => onDrop(item, monitor, day, startTime, endTime, room),
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <Box ref={drop} sx={{ backgroundColor: isOver ? 'lightgreen' : 'white', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', transition: 'background-color 0.3s' }}>
      {/* Dejar la celda vacía */}
    </Box>
  );
};

export default Dashboard1;