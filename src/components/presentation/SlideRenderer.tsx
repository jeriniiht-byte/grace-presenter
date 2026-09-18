import type { Slide } from '../../types/slide';
import type { Theme, ThemeFont } from '../../types/theme';
import { FONT_STACKS } from '../../styles/themes';

interface SlideRendererProps {
  slide: Slide | null;
  theme: Theme;
}

function fontStyle(font: ThemeFont, languageCode?: string): React.CSSProperties {
  return {
    fontFamily: languageCode ? FONT_STACKS[languageCode as keyof typeof FONT_STACKS] ?? font.family : font.family,
    fontSize: font.size,
    fontWeight: font.weight,
    lineHeight: font.lineHeight,
    textAlign: font.alignment
  };
}

function Background({ theme }: { theme: Theme }) {
  if (theme.backgroundVideo) {
    return (
      <video
        key={theme.backgroundVideo}
        src={theme.backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  if (theme.backgroundImage) {
    return (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${theme.backgroundImage})` }}
      />
    );
  }
  return null;
}

export default function SlideRenderer({ slide, theme }: SlideRendererProps) {
  const contentStyle: React.CSSProperties = {
    color: theme.colors.text,
    paddingLeft: theme.spacing.paddingX,
    paddingRight: theme.spacing.paddingX,
    paddingTop: theme.spacing.paddingY,
    paddingBottom: theme.spacing.paddingY
  };
  const hasBackgroundMedia = Boolean(theme.backgroundVideo || theme.backgroundImage);

  const wrapperClass = 'relative w-full h-full overflow-hidden';
  const wrapperStyle: React.CSSProperties = { background: theme.colors.background };

  if (!slide) {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <Background theme={theme} />
        {hasBackgroundMedia && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative w-full h-full flex items-center justify-center" style={contentStyle}>
          <p style={{ ...fontStyle(theme.fonts.reference), color: theme.colors.reference }}>No slide</p>
        </div>
      </div>
    );
  }

  const languageCode = slide.meta.languageCode;

  if (slide.kind === 'media' && slide.mediaUrl) {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        {slide.mediaKind === 'video' ? (
          <video
            key={slide.mediaUrl}
            src={slide.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <img src={slide.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-contain" />
        )}
      </div>
    );
  }

  if (slide.kind === 'title') {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <Background theme={theme} />
        {hasBackgroundMedia && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-4" style={contentStyle}>
          <h1 style={{ ...fontStyle(theme.fonts.title, languageCode), color: theme.colors.accent }}>
            {slide.lines[0]}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <Background theme={theme} />
      {hasBackgroundMedia && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-6" style={contentStyle}>
        <div className="flex flex-col gap-2 max-w-5xl">
          {slide.lines.map((line, idx) => (
            <p key={idx} style={fontStyle(theme.fonts.body, languageCode)}>{line}</p>
          ))}
        </div>
        {slide.transliterationLines && slide.transliterationLines.length > 0 && (
          <div className="flex flex-col gap-2 max-w-5xl opacity-80">
            {slide.transliterationLines.map((line, idx) => (
              <p key={idx} style={{ ...fontStyle(theme.fonts.body), fontSize: `calc(${theme.fonts.body.size} * 0.75)` }}>
                {line}
              </p>
            ))}
          </div>
        )}
        {slide.additionalLanguageBlocks?.map((block, blockIdx) => (
          <div
            key={blockIdx}
            className="flex flex-col gap-2 max-w-5xl pt-4 border-t"
            style={{ borderColor: `${theme.colors.text}22` }}
          >
            {block.lines.map((line, idx) => (
              <p key={idx} style={fontStyle(theme.fonts.body, block.languageCode)}>{line}</p>
            ))}
          </div>
        ))}
        {(slide.meta.reference || slide.meta.songSectionLabel) && (
          <p style={{ ...fontStyle(theme.fonts.reference), color: theme.colors.reference }}>
            {slide.meta.reference ?? slide.meta.songSectionLabel}
          </p>
        )}
      </div>
    </div>
  );
}
