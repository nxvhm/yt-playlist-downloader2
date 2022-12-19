import React, { useState } from 'react';
import { Grid, TextField, Button } from "@mui/material";
import * as VideoServcie from './../../services/VideoService';
import PlaylistItems from '../library/PlaylistItems';
import Fab from '@mui/material/Fab';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

export default function Video() {
  
  // Playlist ID or URL containing playlist ID
  const [playlistSrc, setPlaylistSrc] = useState(null);

  // Error when validating or fetching the playlist
  const [playlistSrcErr, setPlaylistSrcErr] = useState('');

  // Playlist items
  const [items, setItems] = useState([]);

  // Items selected for download
  const [selected, setSelected] = useState([]);

  /**
   * @param {bool} checked 
   * @param {string} videoId 
   */
  function selectionUpdate(checked, videoId) {
    if (checked) {
      selected.push(videoId);
      // Add video id to download selection
      setSelected(selected);
    }
    else {
      // Remove Item from download selection 
      let index2remove = selected.indexOf(videoId);
      selected.splice(index2remove, 1);
      setSelected(selected);
    }

  }

  function getInfo() {
    if (!playlistSrc || !playlistSrc.length) {
      setPlaylistSrcErr("Enter link to video from playlist or Playlist ID");
      return false;
    }
    VideoServcie.getPlaylistItems(playlistSrc).then(items => {
      setItems(items);
    }).catch(errorResponse => {

        setPlaylistSrcErr(
          errorResponse[0] && errorResponse[0].param 
            ? `${errorResponse[0].msg} for ${errorResponse[0].param}`
            : `Error during request. Check if playlist ID is valid`
        );
    });
  }



  return (
    <>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={12} textAlign="center">
          <h2>Playlist Download</h2>
        </Grid>

        <Grid item xs={12} md={4}>
            <TextField 
              id="url" 
              label="Playlist URL or ID" 
              fullWidth={true}
              onChange={e => setPlaylistSrc(e.target.value)} 
              error={playlistSrcErr && playlistSrcErr.length ? true : false}
              helperText={playlistSrcErr ?? null}
            />
        </Grid>

        <Grid item xs={12} textAlign="center">
            <Button variant="contained" sx={{marginTop: 3}} onClick={() => getInfo()}>Get Playlist Videos</Button>
        </Grid>  
        <Grid item xs={12} md={6} lg={6}>
          <PlaylistItems items={items}  selectionUpdate={selectionUpdate} selected={selected}></PlaylistItems>
        </Grid>
        <Fab color="primary" aria-label="add" style={{position: 'fixed', bottom: 10, right: 10}}>
          <DownloadForOfflineIcon />
        </Fab>
      </Grid>
    </>
  );
  }