import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';

// Renamed from ImgMediaCard to Leagues to match your import in MainContent
const Leagues = ({ leagues }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Simple validation to ensure leagues is an array
    const leaguesArray = Array.isArray(leagues) ? leagues : [];

    if (loading) return <p>Loading leagues...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <div className='ligas-box' style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                minHeight: '70vh',
                gap: '30px',
                padding: '20px'
            }}
            >
                {leaguesArray.length === 0 ? (
                    <Typography variant="body1">No leagues available.</Typography>
                ) : (
                    leaguesArray.map((league) => (
                        <Card sx={{ maxWidth: 700, width: '100%' }} key={league.id } >
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {league.Nombre}
                                </Typography>

                                <div className='columna-liga' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Número de participantes
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Cantidad de dinero actual
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Fecha de siguiente jornada
                                    </Typography>
                                </div>

                                <div className='columna-liga' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Puntos actuales
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Posición en liga
                                    </Typography>
                                </div>

                            </CardContent>
                            <CardActions style={{ justifyContent: "space-between" }}>
                                <Button size="small">Seleccionar liga</Button>
                                <Button size="small">Borrar liga</Button>
                            </CardActions>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leagues;