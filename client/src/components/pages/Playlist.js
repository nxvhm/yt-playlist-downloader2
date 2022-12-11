import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Grid, TextField, Button } from "@mui/material";
import * as VideoServcie from './../../services/VideoService';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import Typography from '@mui/material/Typography';

export default function Video() {
  const [playlistSrc, setPlaylistSrc] = useState(null);
  const [playlistSrcErr, setPlaylistSrcErr] = useState('');
  const [items, setItems] = useState([]);

  function getInfo() {
    if (!playlistSrc || !playlistSrc.length) {
      setPlaylistSrcErr("Enter link to video from playlist or Playlist ID");
      return false;
    }
    VideoServcie.getPlaylistItems(playlistSrc).then(items => {
      console.log(items);
      setItems(items);
    }).catch(errorResponse => {

        setPlaylistSrcErr(
          errorResponse[0] && errorResponse[0].param 
            ? `${errorResponse[0].msg} for ${errorResponse[0].param}`
            : `Error during request. Check if playlist ID is valid`
        );
    });
  }

  function PlaylistElement() {
    if (!items.length) {
      return false;
    }

    return (items.map(item => {
      let thumbUrl = "";

      if (item.snippet.thumbnails.high) {
        thumbUrl = item.snippet.thumbnails.high.url;
      } else if (item.snippet.thumbnails.medium) {
        thumbUrl = item.snippet.thumbnails.medium.url;
      } else if (item.snippet.thumbnails.standard) {
        thumbUrl = item.snippet.thumbnails.standard.url;
      }

      return     <Card sx={{ maxWidth: 345 }} key={item.snippet.resourceId.videoId}>
      <CardActionArea>
        <CardMedia
          component="img"
          image={thumbUrl}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {item.snippet.title}
          </Typography>

        </CardContent>
      </CardActionArea>
    </Card>
    }))
  }


  return (
    <>
      <Grid container direction="row" justifyContent="center" alignItems="center" sx={{flexGrow: 1}}>
        <Grid item xs={12}>
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

        <Grid item xs={12}>
            <Button variant="contained" sx={{marginTop: 3}} onClick={() => getInfo()}>Get Playlist Videos</Button>
        </Grid>  

        <PlaylistElement></PlaylistElement>

      </Grid>
    </>
  );
  }