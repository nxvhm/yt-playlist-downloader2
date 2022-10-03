import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Grid } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
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
    const [gettingInfo, setGettingInfo] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState("");
    const [convertionProgress, setConvertionProgress] = useState(0);
    const [isConnected, setIsConnected] = useState(socket.connected);

    function getVideoInfo() {
      if (urlError) return false;
      setGettingInfo(true);
      getVideoData(url).then(videoData => {
        console.log(videoData);
        setVideo(new VideoModel(videoData));
        setGettingInfo(false);
      }).catch(err => {
        console.log(err);
      })
    }

    function mp3DownloadRequest() {
      // Before download start, server fetches info first so we need to display 
      // proper status
      setGettingInfo(true);
      downloadMP3(url).then(res => {
        console.log('video cmp:', res);
        console.log('dlUrl:',res.status == 200 && res.data.downloadUrl ? res.data.downloadUrl : "");
        setDownloadUrl(res.status == 200 && res.data.downloadUrl ? res.data.downloadUrl : "");
        setDownloadProgress(0);
      }).catch(err => {
        console.log(err);
        setDownloadProgress(0);
      })
    }

    useEffect(() => {

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnected', () => {
        setIsConnected(false)
      });
      
      socket.on('dl-progress', progressMsg => {
        // set gettingInfo to false since download already started
        setGettingInfo(false);
        setDownloadProgress(progressMsg.ended ? 0 : parseInt(progressMsg.percents));
      });

      socket.on('convertion-progress', progressMsg => {
        // set gettingInfo to false since download already started
        setGettingInfo(false);
        setConvertionProgress(progressMsg.ended ? 0 : parseInt(progressMsg.percents));
      });

    }, [])

    useEffect(() => {
      if (url) {
        !isUrl(url) ? setErrorUrl("Invalid url") : setErrorUrl("");
      }
    }, [url])

    function Progress(props) {
      if (!props.progress) {
        return false;
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={props.progress}/>
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{props.action}...{props.progress}%</Typography>
          </Box>
        </Box>
      )
    }

    function StatusProgress(props) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 1 }}>
          <Box>
            <CircularProgress />
          </Box>
          <Box >
            <Typography variant="body2" color="text.secondary" sx={{paddingTop: 1, paddingLeft: 2}}>{props.label}</Typography>
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
            xs={12} md={4} 
            sx={{marginTop: 5, marginBottom: 5}} 
            alignItems="center" 
            justifyContent="center">
              <VideoCard data={video} downloadUrl={downloadUrl} mp3DownloadRequest={mp3DownloadRequest}></VideoCard>
              {gettingInfo ? <StatusProgress label="Fetching data..."></StatusProgress> : false} 
              <Progress action="Downloading" progress={downloadProgress}></Progress>
              <Progress action="Convertion" progress={convertionProgress}></Progress>
          </Grid>
        </Grid>
      </>
    );
  }