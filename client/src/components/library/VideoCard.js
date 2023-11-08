import * as React from 'react';
import {Card, CardActions, CardContent, CardMedia, Button, Typography, Box, IconButton} from '@mui/material';
import {RotateRight, CloudDownload} from '@mui/icons-material';
export default function VideoCard(props) {

  if (!props.data) {
    return false;
  }

  function DownloadButton(props) {
    if (!props.downloadUrl) return false;

    return (
      <Button  href={props.downloadUrl} target="_blank" size="small" startIcon={<CloudDownload />}>
        Download Audio
      </Button>
    )
  }

  const getDescription = description => {
    if (!description || description && !description.length) {
      return "Description not available";
    }

    return description.length > 300 
      ? description.slice(0, 300)+'...' 
      : description;
  }

  return (
    <Card sx={{ display: 'flex' }}>
      <CardMedia component="img" sx={{flexGrow: 1, flexBasis: 0}}
        image={props.data.thumbnailUrl}
        alt={props.data.title}
      />      
      <Box sx={{flexDirection: 'column', flexGrow: 2, flexBasis: 0}}>
        <CardContent>
          <Typography component="div" variant="h5">
            {props.data.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {getDescription(props.data.description)}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <Button size="small" onClick={() => props.mp3DownloadRequest()}  startIcon={<RotateRight />}>Convert MP3</Button>
          <DownloadButton downloadUrl={props.downloadUrl}></DownloadButton>
        </Box>
      </Box>

    </Card>
  );
}
