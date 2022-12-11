import 'dotenv/config' 
import axios from 'axios';
import { isString } from 'util';

/**
 * Build API request url
 * @param playlistId 
 * @returns 
 */
export const getPlaylistItemsUrl = (playlistId: string, nextPageToken: string = '') => {

    let itemsLimit = process.env.YT_PLAYLIST_MAX_ITEMS 
        ? +process.env.YT_PLAYLIST_MAX_ITEMS
        : 25;
    let requestUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&maxResults=${itemsLimit}&part=snippet&key=${process.env.YT_KEY}`;
    
    if (nextPageToken && nextPageToken.length) {
        requestUrl += `&pageToken=${nextPageToken}`;
    }

    return requestUrl;
}

/**
 * Check if provided url is a valid yt url and contains playlist param
 * @param url Request url
 * @returns boolean
 */
export const isValidPlaylistUrl = (url: URL): boolean => {
    if (url.host != 'youtube.com' && url.host != 'www.youtube.com') {
        return false;
    }

    if (!url.searchParams.get('list')) {
        return false;
    }

    return true;
}
/**
 * Get videos from Playlist.
 * @param playlistId
 * @returns 
 */
export const getPlaylistItems = async (playlistId: string) => {
    let nextPage = true,
        nextPageToken = '',
        items: object[] = [];

    // While next page available keep doing http requests
    // to the next page untill we got all the items
    while (nextPage) {
        
        let url = getPlaylistItemsUrl(playlistId, nextPageToken);
        console.log('Doing request to', url);

        try {
            
            let response = await axios.get(url);
            // If a request fail stop the loop and return error
            if (response.status != 200 || response.statusText != 'OK') {
                nextPage = false;
                return Promise.reject("API Error. Cannot get playlist data. NOT 200 OR NOT OK"); 
            }
            // Merge the items from the response with the existing items
            items.push(...response.data.items);

            // If nextPageToken provided then we more items for this playlist,
            // so save the token and keep the doing requests
            if (response.data.nextPageToken) {
                nextPageToken = response.data.nextPageToken;
            } 
            // If nextPageToken not available on the response then we got all the items
            else {
                nextPage = false;
            }

        } catch (error) {
            console.log(error)
            return Promise.reject("API Error. Cannot get playlist data"); 
        }

        
    }

    return Promise.resolve(items)
}