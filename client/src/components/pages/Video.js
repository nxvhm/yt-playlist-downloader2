import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Grid } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import socket from './../../services/socket';
import { isUrl } from '../../helpers/functions';
import VideoModel from './../../models/Video';
import { getVideoData, downloadMP3 } from '../../services/VideoService';
import VideoCard from '../library/VideoCard';
export default function Video() {

    const [url, setUrl] = useState(null);
    const [urlError, setErrorUrl] = useState("");
    const [video, setVideo] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isConnected, setIsConnected] = useState(socket.connected);
    function getVideoInfo() {
      if (urlError) return false;
      getVideoData(url).then(videoData => {
        console.log(videoData);
        setVideo(new VideoModel(videoData));
      }).catch(err => {
        console.log(err);
      })
    }

    function mp3DownloadRequest() {
      downloadMP3(url).then(res => {
        console.log('video cmp:', res);
        setProgress(0);
      }).catch(err => {
        console.log(err);
      })
    }

    useEffect(() => {

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnected', () => {
        setIsConnected(false)
      });
      
      socket.on('progress', progressMsg => {
        console.log(progressMsg);
        setProgress(progressMsg.percents);
      });

    }, [])

    useEffect(() => {
      if (url) {
        !isUrl(url) ? setErrorUrl("Invalid url") : setErrorUrl("");
      }
    }, [url])

    function DownloadProgress(props) {
      if (!props.progress) {
        return false;
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={props.progress}/>
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{props.progress}%</Typography>
          </Box>
        </Box>
      )
    }

    
    return (
      <>
        <Grid container direction="row" justifyContent="center" alignItems="center" sx={{flexGrow: 1}}>
          <Grid item xs={12}>
            <h2>Video Download</h2>
          </Grid>

          <Grid item xs={12} md={4}>
              <TextField 
                id="url" 
                label="Video Url" 
                fullWidth={true}
                onChange={e => setUrl(e.target.value)} 
                error={urlError && urlError.length ? true : false}
                helperText={urlError ?? null}
              />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" sx={{marginTop: 3}} onClick={() => getVideoInfo()}>Get Video</Button>
          </Grid>  

          <Grid item 
            xs={12} md={2} 
            sx={{marginTop: 5, marginBottom: 5}} 
            alignItems="center" 
            justifyContent="center">
              <VideoCard data={video} mp3DownloadRequest={mp3DownloadRequest}></VideoCard> 
              <DownloadProgress progress={progress}></DownloadProgress>
          </Grid>

       


        </Grid>
      </>
    );
  }