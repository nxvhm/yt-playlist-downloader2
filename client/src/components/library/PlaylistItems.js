import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';

export default function PlaylistItems(props) {

  function PlaylistCard(props) {
    if (!props.items || (props.items && !Object.keys(props.items).length)) {
        return false;
    }
    return Object.keys(props.items).map(id => {
      props.items[id].progress = 0;
      let item = props.items[id],
        thumbUrl = '';
      
        if (item.thumbnails.high) {
          thumbUrl = item.thumbnails.high.url;
        } else if (item.thumbnails.medium) {
          thumbUrl = item.thumbnails.medium.url;
        } else if (item.thumbnails.standard) {
          thumbUrl = item.thumbnails.standard.url;
        }

        return <PlaylistItem 
          title={item.title}
          videoId={item.videoId}
          description={item.description}
          publishedAt={item.publishedAt}
          thumbUrl={thumbUrl} 
          isChecked={props.selected.indexOf(item.videoId) !== -1} 
          selectionUpdate={props.selectionUpdate} 
          key={item.videoId} 
          progress={item.progress}
        />
    })
  }

  function ProgressBar(props) {
    if (!props.progress || !props.action) {
      return null;
    }

    return (
      <>
        <LinearProgress variant="determinate" value={12}/>
        <Typography variant="body2" color="text.secondary">{props.action}...{props.progress}%</Typography>
      </>
    ); 
      
  }

  function PlaylistItem(props) {  
    return (
        <Grid container direction="row" flexWrap={'nowrap'} className="playlistItem" marginBottom={1}>
          <Grid item paddingRight={2}>
            <img src={props.thumbUrl} style={{width: 175}} alt={props.title}></img>
          </Grid>

          <Grid item flexGrow={1} paddingRight={1}>
            <Typography component={'h3'} style={{marginTop: 0, marginBottom: 2}}>
              {props.title}
            </Typography>

            <Typography component={'p'}>
                Published on: {props.publishedAt}
            </Typography>

            <Typography component={'p'} fontSize={13} marginTop={1} sx={{display: {xs: 'none'}}}>{props.description}</Typography>

            <FormControlLabel 
              control={
                <Checkbox 
                  value={props.videoId}
                  onChange={e => {props.selectionUpdate(e.target.checked, e.target.value)}} 
                  defaultChecked={props.isChecked}  />
              } 
              label="Select for download" 
            />
            <ProgressBar progress={props.progress} action="downloading"></ProgressBar>
          </Grid>
        </Grid>        
    )
  }

  return (
      <PlaylistCard {...props}></PlaylistCard>
      
  )
}