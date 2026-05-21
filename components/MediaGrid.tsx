import { Media } from '../types/media';
import { MediaCard } from './Media/MediaCard';
import { themes } from '../lib/themes';

interface MediaGridProps {
  media: Media[];
  themeId?: string;
}

export const MediaGrid = ({ media, themeId = 'default' }: MediaGridProps) => {
  const theme = themes[themeId] || themes.default;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {media
        // Filter out any items that are not a movie or a TV show
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => (
          <MediaCard key={item.id} item={item} theme={theme} />
        ))}
    </div>
  );
};
