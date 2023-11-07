import React, { useEffect, useState } from 'react';
import { Grid, TextField, Button, LinearProgress, Typography, Box, CircularProgress, FormGroup, FormControl } from "@mui/material";
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
        setGettingInfo(false);
        setErrorUrl(
          typeof err == 'object' && err[0] && err[0].msg 
            ? err[0].msg 
            : 'Invalid url or service not available'
        );
      })
    }

    function mp3DownloadRequest() {
      // Before download start, server fetches info first so we need to display 
      // proper status
      setGettingInfo(true);
      downloadMP3(url).then(res => {
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
        console.log('dl-progress video', progressMsg);
        // set gettingInfo to false since download already started
        setGettingInfo(false);
        setDownloadProgress(progressMsg.ended ? 0 : parseInt(progressMsg.percents));
      });

      socket.on('convertion-progress', progressMsg => {
        console.log('convertion msg', progressMsg);
        // set gettingInfo to false since download already started
        setGettingInfo(false);
        setConvertionProgress(progressMsg.ended ? 0 : parseInt(progressMsg.percents));
        if (progressMsg.ended && progressMsg.path) {
          let filename = progressMsg.path.split('/').splice(-1)[0]
          setDownloadUrl([
            process.env.REACT_APP_API_URL,
            'downloaded',
            filename
          ].join('/'));
        }
      });
      return () => {
        socket.removeAllListeners('dl-progress');
        socket.removeAllListeners('connect');
        socket.removeAllListeners('disconnected');
      }
    }, [])

    useEffect(() => {
      if (url) {
        !isUrl(url) ? setErrorUrl("Invalid url") : setErrorUrl("");
      }
    }, [url])

    useEffect(() => {
        document.title = downloadProgress 
          ? "Downloading "+downloadProgress+"%"
          : document.title = "YT Playlist Downloader"        
    })

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
          <Grid item xs={12} textAlign="center">
            <h2>Video Download</h2>
          </Grid>

          <Grid item xs={12} md={4} p={1}>
            <FormGroup sx={{position: 'flex', flexDirection: 'row'}}>
              <FormControl sx={{flexGrow: 10}}>
                <TextField InputProps={{sx:{borderTopRightRadius: 0, borderBottomRightRadius: 0}}}
                  id="url" 
                  label="Video Url" 
                  onChange={e => setUrl(e.target.value)} 
                  error={urlError && urlError.length ? true : false}
                  helperText={urlError ?? null}
                />
              </FormControl>
              <FormControl sx={{flexGrow: 2}}>
                <Button variant="contained" onClick={() => getVideoInfo()} sx={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: "15px", boxShadow: 0}}>
                  Get Video
                </Button>
              </FormControl>
            </FormGroup>
          </Grid>

          <Grid item xs={12} textAlign="center">
            {/* <Button variant="contained" sx={{marginTop: 3}} onClick={() => getVideoInfo()}>Get Video</Button> */}
          </Grid>  

          <Grid item xs={12} sm={6} md={4} lg={3} sx={{marginTop: 5, marginBottom: 5}} p={1}>
              <VideoCard data={video} downloadUrl={downloadUrl} mp3DownloadRequest={mp3DownloadRequest}></VideoCard>
              {gettingInfo ? <StatusProgress label="Fetching data..."></StatusProgress> : false} 
              <Progress action="Downloading" progress={downloadProgress}></Progress>
              <Progress action="Convertion" progress={convertionProgress}></Progress>
          </Grid>
        </Grid>
      </>
    );
  }