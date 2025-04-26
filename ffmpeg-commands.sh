# /bin/bash
# mkdir movie
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -map 0:v -map 0:a:0 -map 0:a:1 -map 0:v -map 0:a:0 -map 0:a:1 -map 0:v -map 0:a:0 -map 0:a:1 -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" -master_pl_name master.m3u8 -s:v:0 1920x800 -b:v:0 2500k -s:v:1 1280x534 -b:v:1 1600k -s:v:2 854x356 -b:v:2 900k -hls_segment_filename "movie/%v/segment%d.ts" "movie/%v/index.m3u8"

# mkdir movie
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -map 0:0 -map 0:1 -map 0:2 -map 0:3 -c:v libx264 -c:a aac -c:s mov_text -f hls -hls_time 20 -hls_playlist_type vod -var_stream_map "v:0,a:0,name:1080p" -master_pl_name master.m3u8 -s:v:0 1920x800 -b:v:0 2500k -hls_segment_filename "movie/%v/segment%d.ts" "movie/%v/index.m3u8"

# VIDEO
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -preset veryfast -crf 30 -map 0:0 -map 0:0 -map 0:0 -c:v libx264 -c:a aac -c:s mov_text -f hls -hls_time 20 -hls_playlist_type vod -var_stream_map "v:0,name:1080p v:1,name:720p v:2,name:480p" -master_pl_name "master-video.m3u8" -s:v:0 1920x800 -b:v:0 3200k -s:v:1 1280x534 -b:v:1 2000k -s:v:2 854x356 -b:v:2 1200k -hls_segment_filename "movie/%v/segment%d.ts" "movie/%v/index.m3u8"

# AUDIO
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -preset veryfast -crf 30 -map 0:1 -map 0:2 -c:v libx264 -c:a aac -c:s mov_text -f hls -hls_time 20 -hls_playlist_type vod -var_stream_map "a:0,name:Hindi a:1,name:English" -master_pl_name "master-audio.m3u8" -hls_segment_filename "movie/%v/segment%d.ts" "movie/%v/index.m3u8"

# SUBS
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -preset fast -map 0:s -c:s copy "movie/subtitles.ass"

# MPD
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -preset veryfast -threads 4 -crf 30 -map 0:v -map 0:a -map 0:s -c:v libx264 -c:a aac -c:s mov_text -b:v:0 3200k -s:v:0 1920x1080 -profile:v:0 high -b:v:1 2000k -s:v:1 1280x720 -profile:v:1 main -b:v:2 1200k -s:v:2 854x480 -profile:v:2 baseline -b:a:0 192k -b:a:1 192k -use_timeline 1 -use_template 1 -init_seg_name 'init-$RepresentationID$.mp4' -media_seg_name 'chunk-$RepresentationID$-$Number%05d$.m4s' -adaptation_sets "id=0,streams=v id=1,streams=a id=2,streams=a id=3,streams=s" -f dash movie/output.mpd

# Only Hindi Audio + Video
# libx264 (slow)
# ffmpeg -i "Madame Web (2024) 1080p HD WEB-DL.mkv" -preset veryfast -threads 4 -crf 30 -map 0:v -map 0:1 -map 0:v -map 0:1 -map 0:v -map 0:1 -c:v libx264 -c:a aac -c:s webvtt -f hls -hls_time 20 -hls_playlist_type vod -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" -master_pl_name "master.m3u8" -s:v:0 1920x800 -b:v:0 3200k -s:v:1 1280x534 -b:v:1 2000k -s:v:2 854x356 -b:v:2 1200k -hls_segment_filename "movie1/%v/segment%d.ts" "movie1/%v/index.m3u8"

# h264_qsv (fast)
# ffmpeg -i "Swatantra Veer Savarkar (2024) 1080p FHD Hindi 5.1.mkv" -preset veryfast -crf 30 -threads 100 -map 0:v -map 0:1 -map 0:v -map 0:1 -map 0:v -map 0:1 -c:v h264_qsv -c:a aac -c:s webvtt -f hls -hls_time 20 -hls_playlist_type vod -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" -master_pl_name "master.m3u8" -s:v:0 1920x1080 -b:v:0 2900k -s:v:1 1280x720 -b:v:1 1700k -s:v:2 854x480 -b:v:2 900k -hls_segment_filename "movie4/%v/segment%d.ts" "movie4/%v/index.m3u8"

# All
# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -preset fast -crf 30 -threads 4 -map 0:v -map 0:a -map 0:a -map 0:s -map 0:v -map 0:a -map 0:a -map 0:s -map 0:v -map 0:a -map 0:a -map 0:s -c:v libx264 -c:a aac -c:s webvtt -b:v:0 3200k -s:v:0 1920x1080 -profile:v:0 high -b:v:1 2000k -s:v:1 1280x720 -profile:v:1 main -s:v:2 854x480 -b:v:2 1200k -profile:v:2 baseline -b:a:0 192k -b:a:1 192k -b:a:2 150k -b:a:3 150k -b:a:4 120k -b:a:5 120k -hls_time 20 -hls_playlist_type vod -var_stream_map "v:0,a:0,a:1,s:0,name:FHD v:1,a:2,a:3,s:1,name:HD v:2,a:4,a:5,s:2,name:MED" -master_pl_name "master-test.m3u8" -f hls -hls_segment_filename "movie/%v/segment%d.ts" "movie/%v/index.m3u8"

# ffmpeg -i "Godzilla x Kong The New Empire (2024) 1080p FHD AMZN WEB-DL Hindi - English.mkv" -preset fast -crf 30 -threads 4 -map 0:v -map 0:a -map 0:a -map 0:s -map 0:v -map 0:a -map 0:a -map 0:s -map 0:v -map 0:a -map 0:a -map 0:s -c:v libx264 -c:a aac -c:s webvtt -b:v:0 3200k -s:v:0 1920x1080 -profile:v:0 high -b:v:1 2000k -s:v:1 1280x720 -profile:v:1 main -s:v:2 854x480 -b:v:2 1200k -profile:v:2 baseline -b:a:0 192k -b:a:1 192k -b:a:2 150k -b:a:3 150k -b:a:4 120k -b:a:5 120k -hls_time 20 -hls_playlist_type vod -var_stream_map "v:0,a:0,a:1,s:0,name:FHD" -master_pl_name "master-test.m3u8" -f hls -hls_segment_filename "movie/%v/segment%d.ts" "movie/%v/index.m3u8"

# Bre video
# ffmpeg -i "BreWelcomeFinal.mp4"

# ffmpeg -i "BreWelcomeFinal.mp4" -preset veryfast -crf 30 -threads 100 -map 0:v -map 0:1 -map 0:v -map 0:1 -map 0:v -map 0:1 -map 0:v -map 0:1 -map 0:v -map 0:1 -c:v h264_qsv -c:a aac -c:s webvtt -f hls -hls_time 10 -hls_playlist_type vod -var_stream_map "v:0,a:0,name:2160p v:1,a:1,name:1440p v:2,a:2,name:1080p v:3,a:3,name:720p v:4,a:4,name:480p" -master_pl_name "master.m3u8" -s:v:0 3840x2160 -b:v:0 30000k -s:v:1 2560x1440 -b:v:1 20000k -s:v:2 1920x1080 -b:v:2 15000k -s:v:3 1280x720 -b:v:3 10000k -s:v:4 854x480 -b:v:4 6670k -hls_segment_filename "bre/%v/segment%d.ts" "bre/%v/index.m3u8"

# Only Video
# ffmpeg -i "movie.mkv" -preset veryfast -crf 30 -threads 100 -map 0:v -map 0:v -map 0:v -map 0:v -c:v h264_qsv -c:a aac -c:s webvtt -f hls -hls_time 10 -hls_playlist_type vod -var_stream_map "v:0,name:1080p v:1,name:720p v:2,name:480p v:3,name:360p" -master_pl_name "master.m3u8" -s:v:0 1920x1080 -b:v:0 3200k -s:v:1 1280x720 -b:v:1 1800k -s:v:2 854x480 -b:v:2 1000k -s:v:3 640x360 -b:v:3 700k -hls_segment_filename "test/video/%v/segment%d.ts" "test/video/%v/index.m3u8"

# Only audio (Here by dual audio)
# ffmpeg -i "movie.mkv" -preset veryfast -crf 30 -threads 100 -map 0:2 -map 0:1 -c:a aac -f hls -hls_time 10 -hls_playlist_type vod -var_stream_map "a:0,name:eng a:1,name:hin" -master_pl_name "master.m3u8" -ac:0 2 -b:a:0 300k -ac:1 2 -b:a:1 192k -hls_segment_filename "test/audio/%v/segment%d.ts" "test/audio/%v/index.m3u8"

# Only subs
# ffmpeg -i "D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv" -preset veryfast -crf 30 -threads 100 -map 0:3 -c:s webvtt -f segment -segment_time 10 -segment_list "test/subs/eng/index.m3u8" -segment_list_type m3u8 -segment_format webvtt "test/subs/eng/segment%d.vtt"

# Use below command to generate a single vtt and create a master m3u8 of the vtt file with total duration in info to be added in hls
# ffmpeg -i "D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv" -preset veryfast -crf 30 -threads 100 -map 0:3 -c:s webvtt "test/subs/eng.vtt"

# Shifting delay in subs
# ffmpeg -itsoffset 2 -i "D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv" -map 0:3 -c:s webvtt "test/subs/eng.vtt"
# ffmpeg -itsoffset 2 -i "test/subs/org.vtt" -c:s webvtt "test/subs/eng.vtt"

ffmpeg -i "D:/Content/Captain.America.Brave.New.World.(2025).WEB-DL.1080p.x264.Hin.+.Eng-AAC.5.1.192Kbps.ESub.Vegamovies.is.mkv" -y -map 0:1 -map 0:2 -c:a:0 aac -c:a:1 aac -f hls -hls_time 10 -hls_playlist_type vod -var_stream_map "a:0,name:audio-1 a:1,name:audio-2" -master_pl_name master.m3u8 -b:a:0 128k -b:a:1 640k -hls_segment_filename "out/movie-venom/audio/%v/segment%d.ts" "out/movie-venom/audio/%v/index.m3u8"
