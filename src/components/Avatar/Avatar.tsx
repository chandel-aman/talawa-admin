import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import styles from 'components/Avatar/Avatar.module.css';

interface InterfaceAvatarProps {
  name: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  avatarStyle?: string;
  dataTestId?: string;
  shape?: 'circle' | 'square' | 'rounded';
}

/**
 * A component that generates and displays an avatar based on the provided name.
 * The avatar is generated using the DiceBear library with the initials style.
 *
 * @param name - The name used to generate the avatar.
 * @param alt - Alternative text for the avatar image.
 * @param size - Size of the avatar image.
 * @param avatarStyle - Custom CSS class for the avatar image.
 * @param dataTestId - Data-testid attribute for testing purposes.
 * @param radius - Radius of the avatar corners.
 *
 * @returns JSX.Element - The rendered avatar image component.
 */
const Avatar = ({
  name,
  alt = 'Dummy Avatar',
  size = 'md',
  avatarStyle,
  dataTestId,
  shape = 'circle',
}: InterfaceAvatarProps): JSX.Element => {
  const sizeMap = {
    xs: 44,
    sm: 64,
    md: 96,
    lg: 160,
    xl: 200,
  };
  // Memoize the avatar creation to avoid unnecessary recalculations
  const avatar = useMemo(() => {
    return createAvatar(initials, {
      size: sizeMap[size],
      seed: name,
      radius: shape === 'circle' ? 50 : shape === 'rounded' ? 8 : 0,
    }).toDataUriSync();
  }, [name, size, shape]);

  const svg = avatar.toString();

  const getAvatarClassName = (): string => {
    let className = `${styles.avatar} ${styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`]}`;
    if (shape === 'square') className += ` ${styles.avatarSquare}`;
    if (shape === 'rounded') className += ` ${styles.avatarRounded}`;
    if (avatarStyle) className += ` ${avatarStyle}`;
    return className;
  };

  return (
    <div className={styles.imageContainer}>
      <img
        src={svg}
        alt={alt}
        className={getAvatarClassName()}
        data-testid={dataTestId || ''}
      />
    </div>
  );
};

export default Avatar;
