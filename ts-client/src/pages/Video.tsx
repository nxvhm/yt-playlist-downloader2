import React, { useContext, useEffect, useState } from 'react';
import SocketContext from '../hooks/context/SocketContext';
import { getVideoData, downloadAudio } from '../services/VideoService';
import { VideoDataType, ProgressMessageType } from '../definitions';
import { isUrl } from '../helpers';
import { Grid, TextField, Button, LinearProgress, Typography, Box, CircularProgress, FormGroup, FormControl } from "@mui/material";
import VideoCard from '../components/VideoCard';
import { videoFormat } from '@distube/ytdl-core';


export default function Video() {

	const {connection: socket} = useContext(SocketContext)
	const [url, setUrl] = useState("");
	const [urlError, setErrorUrl] = useState("");
	const [video, setVideo] = useState<VideoDataType>({} as VideoDataType);
	const [format, setFormat] = useState<videoFormat>({} as videoFormat);
	const [mp3Convert, setMp3Convert] = useState(true);
	const [gettingInfo, setGettingInfo] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [downloadUrl, setDownloadUrl] = useState("");
	const [convertionProgress, setConvertionProgress] = useState(0);

	const getVideoInfo = () => {
		if (urlError) return false;
		setGettingInfo(true);

		getVideoData(url).then(videoData => {
			console.log(videoData);
			setVideo(videoData);
			setGettingInfo(false);
			setDownloadUrl("");
		}).catch(err => {
			setGettingInfo(false);
			setErrorUrl(
				typeof err == 'object' && err[0] && err[0].msg
					? err[0].msg
					: 'Invalid url or service not available'
			);
		})
	}

	const mp3DownloadRequest = () => {
		// Before download start, server fetches info first so we need to display
		// proper status
		setGettingInfo(true);
		downloadAudio({url, mp3Convert}).then(_res => {
			setDownloadProgress(0);
		}).catch(err => {
			console.log(err);
			setDownloadProgress(0);
		})
	}

	useEffect(() => {
		socket?.on('dl-progress', progressMsg => {
			console.log('dl-progress video', progressMsg);
			// set gettingInfo to false since download already started
			setGettingInfo(false);
			setDownloadProgress(progressMsg.completed ? 0 : parseInt(progressMsg.percents));
			if (progressMsg.completed && !mp3Convert)
				setDownloadUrl([import.meta.env.VITE_API_URL,'downloaded',progressMsg.path].join('/'));
		});

		socket?.on('convertion-progress', progressMsg => {
			console.log('convertion msg', progressMsg);
			// set gettingInfo to false since download already started
			setGettingInfo(false);
			setConvertionProgress(progressMsg.completed ? 0 : parseInt(progressMsg.percents));
			if (progressMsg.completed && progressMsg.path) {
				let filename = progressMsg.path.split('/').splice(-1)[0]
				setDownloadUrl([
					import.meta.env.VITE_API_URL,
					'downloaded',
					filename
				].join('/'));
			}
		});
		return () => {
			socket?.removeAllListeners('dl-progress');
			socket?.removeAllListeners('convertion-progress');
		}
	}, [mp3Convert, socket])

	useEffect(() => {
		if (url) {
			!isUrl(url) ? setErrorUrl("Invalid url") : setErrorUrl("");
		}
	}, [url])

	useEffect(() => {
			document.title = downloadProgress
				? "Downloading "+downloadProgress+"%"
				: document.title = "YT Playlist Downloader"
	})

	const toggleMP3Convert = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMp3Convert(e.target.checked)
	}

	function Progress(props: ProgressMessageType) {
		if (!props.progress) {
			return false;
		}
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
				<Box sx={{ width: '100%', mr: 1 }}>
					<LinearProgress variant="determinate" value={props.progress}/>
				</Box>
				<Box sx={{ minWidth: 35 }}>
					<Typography variant="body2" color="text.secondary">{props?.action}...{props.progress}%</Typography>
				</Box>
			</Box>
		)
	}

	function selectFormat(bitRate: number) {
		const filteredFormats = video.formats.filter(format => format.audioBitrate === bitRate);
		if (!filteredFormats.length)
			return false;
		setFormat(filteredFormats[0]);
	}

	function StatusProgress(props: ProgressMessageType) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 1 }}>
				<Box>
					<CircularProgress />
				</Box>
				<Box >
					<Typography variant="body2" color="text.secondary" sx={{paddingTop: 1, paddingLeft: 2}}>{props.label}</Typography>
				</Box>

			</Box>
		)
	}

	return (
		<>
			<Grid container direction="row" justifyContent="center" alignItems="center" sx={{flexGrow: 1}}>
				<Grid item xs={12} textAlign="center">
					<h2>Video Download</h2>
				</Grid>
			</Grid>

			<Grid container direction="row" justifyContent="center" alignItems="center">
				<Grid item xs={12} md={4}  p={1}>
					<FormGroup sx={{position: 'flex', flexDirection: 'row'}}>
						<FormControl sx={{flexGrow: 10}}>
							<TextField InputProps={{sx:{borderTopRightRadius: 0, borderBottomRightRadius: 0}}}
								id="url"
								label="Video Url"
								onChange={e => setUrl(e.target.value)}
								error={urlError && urlError.length ? true : false}
								helperText={urlError ?? null}
							/>
						</FormControl>
						<FormControl sx={{flexGrow: 2}}>
							<Button variant="contained" onClick={() => getVideoInfo()} sx={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: "15px", boxShadow: 0}}>
								Get Video
							</Button>
						</FormControl>
					</FormGroup>
				</Grid>
			</Grid>

			<Grid container direction="row" justifyContent="center" alignItems="center">
				<Grid item xs={12} sm={6} md={6} lg={4} sx={{marginTop: 5, marginBottom: 5}} p={1}>
						<VideoCard
							data={video}
							downloadUrl={downloadUrl}
							mp3DownloadRequest={mp3DownloadRequest}
							selectFormat={selectFormat}
							mp3Convert={mp3Convert}
							toggleMP3Convert={toggleMP3Convert}
							audioBitrate={format?.audioBitrate ? format.audioBitrate : undefined}>
						</VideoCard>
						{gettingInfo ? <StatusProgress label="Fetching data..."></StatusProgress> : false}
						<Progress action="Downloading" progress={downloadProgress}></Progress>
						<Progress action="Convertion" progress={convertionProgress}></Progress>
				</Grid>
			</Grid>

		</>
	);
}
