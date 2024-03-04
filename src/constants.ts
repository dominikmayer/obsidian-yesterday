export const audioExtensions = [
	'flac',
	'm4a',
	'mp3',
	'ogg',
	'wav'
]

export const imageExtensions = [
	'gif',
	'jpg', 
	'jpeg', 
	'png', 
	'webp'
];

export const videoExtensions = [
    'avi',
    'm4v',
    'mkv',
    'mov',
    'mp4',
    'webm'
];

export const mediaExtensions = [ 
	...audioExtensions, 
	...imageExtensions,
    ...videoExtensions
];