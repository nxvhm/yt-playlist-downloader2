import { Link } from "react-router-dom";
import Button from '@mui/material/Button';

export default function Video() {
    return (
      <>
        <main>
          <h2>Playlist Download</h2>
          <p>
            That feels like an existential question, don't you
            think?
          </p>
        </main>
        <nav>
          <Link to="/"><Button variant="contained">Home</Button></Link>
        </nav>
      </>
    );
  }