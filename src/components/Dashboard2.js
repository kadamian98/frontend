import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import * as XLSX from 'xlsx';

const Dashboard2 = () => {
  const [faculties, setFaculties] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');

  useEffect(() => {
    axios.get('/faculties').then(response => {
      setFaculties(response.data);
    });
    axios.get('/schedules').then(response => {
      setSchedules(response.data);
    });
  }, []);

  const handleFacultyChange = (event) => {
    setSelectedFaculty(event.target.value);
  };

  const exportToExcel = () => {
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

    const data = days.map(day => {
      const row = { 'Día/Horario': day };
      times.forEach(time => {
        const rooms = schedules
          .filter(schedule => schedule.faculty === selectedFaculty && schedule.day === day && schedule.startTime === time.start)
          .map(schedule => schedule.room)
          .join(', ');
        row[`${time.start}-${time.end}`] = rooms;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
    XLSX.writeFile(workbook, 'dashboard2_schedule.xlsx');
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
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          Asignación de Salones por Facultad
        </Typography>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Facultad</InputLabel>
          <Select value={selectedFaculty} onChange={handleFacultyChange}>
            {faculties.map(faculty => (
              <MenuItem key={faculty._id} value={faculty.name}>
                {faculty.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
        <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Día/Horario</TableCell>
                {times.map(time => (
                  <TableCell key={time.start}>{time.start}-{time.end}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map(day => (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  {times.map(time => (
                    <TableCell key={`${day}-${time.start}`} sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                      {schedules
                        .filter(schedule => schedule.faculty === selectedFaculty && schedule.day === day && schedule.startTime === time.start)
                        .map(schedule => schedule.room)
                        .join(', ')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Dashboard2;