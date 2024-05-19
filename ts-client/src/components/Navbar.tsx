import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{lineHeight: 1}}>
            YT Downloader
          </Typography>

          <Button component={Link} to="/" color="inherit" sx={{marginLeft: 5}}>Video</Button>
          <Button component={Link} to="/playlist" color="inherit" sx={{marginLeft: 5}}>Playlist</Button>
            
        </Toolbar>
      </AppBar>
    </Box>
  );
}