

Audio--------------------------------------------------
ffmpeg -i D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv -y -map 0:1 -map 0:2 -c:a:0 aac -c:a:1 aac -f hls -hls_time 10 -hls_playlist_type vod -var_stream_map a:0,name:audio-1 a:1,name:audio-2 -master_pl_name master.m3u8 -b:a:0 0k -b:a:1 640k -hls_segment_filename out/movie-venom/audio/%v/segment%d.ts out/movie-venom/audio/%v/index.m3u8

Subtitle--------------------------------------------------
ffmpeg -itsoffset 0 -i D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv -y -map 0:3 -c:s webvtt out/movie-venom/subs/sub-1.vtt

Subtitle--------------------------------------------------
ffmpeg -itsoffset 0 -i D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv -y -map 0:4 -c:s webvtt out/movie-venom/subs/sub-2.vtt

Subtitle--------------------------------------------------
ffmpeg -itsoffset 0 -i D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv -y -map 0:5 -c:s webvtt out/movie-venom/subs/sub-3.vtt