import 'dotenv/config' 
import { Express, Request, Response } from 'express';
export const GetPlaylistInfoForm = (req: Request, res: Response) => {
    return res.render('playlist')
}
//https://youtube.googleapis.com/youtube/v3/playlistItems?playlistId=PL1IU4H9Dvninizk2jajFt_J9GuCH_fTIX&maxResults=50&part=snippet&key=
export const GetPlaylistContents = (req: Request, res: Response) => {

    let url;

    try {

        url = new URL(req.body.url);

    } catch (error) {
        return res.json({success: 0, error: 1, msg: (error as Error).message});
    }
    
    let playlistId = url.searchParams.get('list');

    if (!playlistId) {
        return res.json({success: 0, error: 1, msg: 'Playlist id cannot be found'});
    }
    console.log(process.env.YT_KEY)
    console.log('playlist to fetch info for:', playlistId);
}
