

Audio--------------------------------------------------
ffmpeg -i D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv -y -map 0:1 -f hls -hls_time 10 -hls_playlist_type vod -c:a aac -var_stream_map a:0,name:audio-1 -master_pl_name audio-1/master.m3u8 -b:a 128k -hls_segment_filename out/movie-venom/audio/%v/segment%d.ts out/movie-venom/audio/%v/index.m3u8