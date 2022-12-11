import 'dotenv/config' 
import { Request, Response } from 'express';
import * as YoutubeHelper from '../Helpers/Youtube';
import { body, validationResult } from 'express-validator';
import axios from 'axios';

export const getPlaylistItems = async (req: Request, res: Response) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    let playlistId: string | null;

    try {

        let url = new URL(req.body.playlist);
        
        if (!YoutubeHelper.isValidPlaylistUrl(url)) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid youtube url or playlist not provided',
                    param: 'Playlist',
                }]
            });
        }

        playlistId = url.searchParams.get('list');

    } catch (error) {
        playlistId = req.body.playlist;
    }

    if (!playlistId) {
        return res.status(400).json({
            errors: [{
                msg: 'Invalid value',
                param: 'Playlist',
            }]
        });
    }

    let playlistItem = await YoutubeHelper.getPlaylistItems(playlistId);

    return res.status(200).json(playlistItem);
}

export const getPlaylistItemsRequestValidator  = [
    body('playlist').isLength({ min: 34 })
];

//https://youtube.googleapis.com/youtube/v3/playlistItems?playlistId=PL1IU4H9Dvninizk2jajFt_J9GuCH_fTIX&maxResults=50&part=snippet&key=
