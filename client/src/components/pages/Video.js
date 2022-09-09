import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Grid } from "@mui/material";
import React, { useEffect, useState } from 'react';
import socket from './../../services/socket';
import { isUrl } from '../../helpers/functions';
import axios from './../../services/axios';

export default function Video() {

    const [url, setUrl] = useState(null);
    const [urlError, setErrorUrl] = useState("");

    const [isConnected, setIsConnected] = useState(socket.connected);

    function getVideoInfo() {
      if (urlError) return false;
      axios.post('/get-info', {
        url,
        clientId: socket.id
      }).then(res => {
        console.log(res);
      })
    }

    useEffect(() => {

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnected', () => {
        setIsConnected(false)
      });
    }, [])

    useEffect(() => {
      if (url) {
        !isUrl(url) ? setErrorUrl("Invalid url") : setErrorUrl("");
      }
    }, [url])
    
    return (
      <>
        <Grid container sx={{flexGrow: 1}} justify="center" alignItems="center">
          <Grid item xs={12}>
            <h2>Video Download {url}</h2>
          </Grid>


          <Grid item xs={12} md={4} sx={{padding: 1, margin: '0px auto'}}>
              <TextField 
                id="url" 
                label="Video Url" 
                fullWidth 
                onChange={e => setUrl(e.target.value)} 
                error={urlError && urlError.length ? true : false}
                helperText={urlError ?? null}
              />
          </Grid>

          <Grid item xs={12} alignItems="center">
            <Button variant="contained" sx={{marginTop: 3}} onClick={() => getVideoInfo()}>Download</Button>
          </Grid>  

        </Grid>
      </>
    );
  }