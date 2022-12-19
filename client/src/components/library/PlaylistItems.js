import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function PlaylistItems(props) {

  function PlaylistCard(props) {
    if (!props.items || (props.items && !props.items.length)) {
        return false;
    }

    return props.items.map(item => {

        let videoId = item.snippet.resourceId.videoId,
            title = item.snippet.title,
            description = item.snippet.description,
            publishedAt = item.snippet.publishedAt,
            thumbUrl = '';

        if (item.snippet.thumbnails.high) {
            thumbUrl = item.snippet.thumbnails.high.url;
        } else if (item.snippet.thumbnails.medium) {
            thumbUrl = item.snippet.thumbnails.medium.url;
        } else if (item.snippet.thumbnails.standard) {
            thumbUrl = item.snippet.thumbnails.standard.url;
        }
      
        return <PlaylistItem 
          title={title}
          videoId={videoId}
          description={description}
          publishedAt={publishedAt}
          thumbUrl={thumbUrl} 
          isChecled={props.selected.indexOf(videoId) !== -1} 
          selectionUpdate={props.selectionUpdate} 
          key={videoId} 
        />
    })
  }


  function PlaylistItem(props) {  
    return (
        <Grid container direction="row" wrap={'nowrap'} className="playlistItem" marginBottom={1}>
          <Grid item paddingRight={2}>
            <img src={props.thumbUrl} style={{width: 175}} alt={props.title}></img>
          </Grid>

          <Grid item>
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
          </Grid>
        </Grid>        
    )
  }

  return (
      <PlaylistCard {...props}></PlaylistCard>
      
  )
}