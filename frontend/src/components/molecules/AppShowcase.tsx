import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Carousel } from '@mantine/carousel';
import { useMantineColorScheme } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';
import '@mantine/carousel/styles.css';

const CarouselWrapper = styled.div<{ isDark: boolean }>`
  width: 100%;
  max-width: 600px;
  position: relative;
  
  /* Efecto de resplandor sutil alrededor del carrusel */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    padding: 2px;
    background: ${props => props.isDark 
      ? 'linear-gradient(135deg, rgba(76, 180, 111, 0.3), rgba(76, 180, 111, 0.1))' 
      : 'linear-gradient(135deg, rgba(76, 180, 111, 0.2), rgba(76, 180, 111, 0.05))'};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.6;
    z-index: 0;
  }
  
  .mantine-Carousel-root {
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    background: ${props => props.isDark 
      ? 'linear-gradient(135deg, rgba(29, 30, 48, 0.4), rgba(38, 50, 68, 0.6))' 
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(230, 239, 232, 0.9))'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.isDark 
      ? 'rgba(76, 180, 111, 0.15)' 
      : 'rgba(76, 180, 111, 0.1)'};
    box-shadow: ${props => props.isDark 
      ? '0 25px 70px rgba(0, 0, 0, 0.4), 0 10px 30px rgba(76, 180, 111, 0.08)' 
      : '0 25px 70px rgba(0, 0, 0, 0.12), 0 10px 30px rgba(76, 180, 111, 0.05)'};
  }

  .mantine-Carousel-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }

  .mantine-Carousel-indicator {
    width: 8px;
    height: 8px;
    transition: all 300ms ease;
    background-color: ${props => props.isDark ? '#4CB46F' : 'var(--app-accent)'};
    opacity: 0.25;
    border: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(76, 180, 111, 0.3)'};

    &[data-active] {
      width: 28px;
      opacity: 1;
      box-shadow: ${props => props.isDark 
        ? '0 2px 8px rgba(76, 180, 111, 0.4)' 
        : '0 2px 8px rgba(76, 180, 111, 0.3)'};
    }
  }

  .mantine-Carousel-indicators {
    bottom: 20px;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    
    &::before {
      inset: -1px;
    }
  }
`;

const SlideImage = styled.img<{ isDark: boolean }>`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  filter: ${props => props.isDark ? 'brightness(0.9)' : 'none'};
`;

const PlaceholderSlide = styled.div<{ isDark: boolean; gradientIndex: number }>`
  width: 100%;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${props => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    return gradients[props.gradientIndex % gradients.length];
  }};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const PlaceholderIcon = styled.div`
  font-size: 6rem;
  opacity: 0.5;
  z-index: 1;
`;

const SlideContent = styled.div`
  position: relative;
  width: 100%;
`;

const SlideCaption = styled.div<{ isDark: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 28px;
  background: ${props => props.isDark 
    ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)' 
    : 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 70%, transparent 100%)'};
  backdrop-filter: blur(8px);
  
  h3 {
    margin: 0 0 6px 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: ${props => props.isDark ? '#ffffff' : 'var(--app-text)'};
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
    color: ${props => props.isDark ? '#d0d0d5' : 'var(--app-text-secondary)'};
    opacity: 0.9;
  }
`;

interface AppImage {
  src: string;
  title: string;
  description: string;
  icon: string;
}

export const AppShowcase: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const autoplay = useRef(
    Autoplay({ 
      delay: 3000, 
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: true
    })
  );
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [embla, setEmbla] = useState<any>(null);

  // Imágenes de demostración de la aplicación
  const appImages: AppImage[] = [
    {
      src: '/images/app-dashboard.jpg',
      title: 'Panel de Control',
      description: 'Visualiza tu progreso de forma clara y sencilla',
      icon: '📊'
    },
    {
      src: '/images/app-nutrition.jpg',
      title: 'Planes de Nutrición',
      description: 'Dietas personalizadas adaptadas a tus objetivos',
      icon: '🥗'
    },
    {
      src: '/images/app-training.jpg',
      title: 'Rutinas de Entrenamiento',
      description: 'Ejercicios diseñados especialmente para ti',
      icon: '💪'
    },
    {
      src: '/images/app-tracking.jpg',
      title: 'Seguimiento en Tiempo Real',
      description: 'Monitorea tu evolución día a día',
      icon: '📈'
    },
    {
      src: '/images/app-professionals.jpg',
      title: 'Profesionales Dedicados',
      description: 'Asesoramiento personalizado cuando lo necesites',
      icon: '👥'
    }
  ];

  // Configurar el carrusel cuando se monta
  useEffect(() => {
    if (embla) {
      // Asegurar que el autoplay esté activo
      autoplay.current.play();
    }
  }, [embla]);

  return (
    <CarouselWrapper isDark={isDark}>
      <Carousel
        withIndicators
        getEmblaApi={setEmbla}
        plugins={[autoplay.current]}
        onMouseEnter={() => autoplay.current.stop()}
        onMouseLeave={() => autoplay.current.play()}
        height={450}
        slideSize="100%"
        slideGap="md"
        withControls={false}
      >
        {appImages.map((image, index) => (
          <Carousel.Slide key={index}>
            <SlideContent>
              {imageErrors.has(index) ? (
                <PlaceholderSlide isDark={isDark} gradientIndex={index}>
                  <PlaceholderIcon>{image.icon}</PlaceholderIcon>
                </PlaceholderSlide>
              ) : (
                <SlideImage 
                  src={image.src} 
                  alt={image.title}
                  isDark={isDark}
                  onError={() => {
                    setImageErrors(prev => new Set(prev).add(index));
                  }}
                />
              )}
              <SlideCaption isDark={isDark}>
                <h3>{image.title}</h3>
                <p>{image.description}</p>
              </SlideCaption>
            </SlideContent>
          </Carousel.Slide>
        ))}
      </Carousel>
    </CarouselWrapper>
  );
};

