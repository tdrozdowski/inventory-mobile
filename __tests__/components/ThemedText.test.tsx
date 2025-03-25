import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/ThemedText';

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#000000'),
}));

describe('ThemedText', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);
    
    // Check if the text is rendered
    const textElement = getByText('Test Text');
    expect(textElement).toBeTruthy();
    
    // Check if the default style is applied
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { color: '#000000' },
        expect.objectContaining({ fontSize: 16, lineHeight: 24 }),
      ])
    );
  });

  it('renders with title style when type is title', () => {
    const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
    
    // Check if the text is rendered
    const textElement = getByText('Title Text');
    expect(textElement).toBeTruthy();
    
    // Check if the title style is applied
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { color: '#000000' },
        expect.objectContaining({ fontSize: 32, fontWeight: 'bold', lineHeight: 32 }),
      ])
    );
  });

  it('renders with subtitle style when type is subtitle', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);
    
    // Check if the text is rendered
    const textElement = getByText('Subtitle Text');
    expect(textElement).toBeTruthy();
    
    // Check if the subtitle style is applied
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { color: '#000000' },
        expect.objectContaining({ fontSize: 20, fontWeight: 'bold' }),
      ])
    );
  });

  it('renders with defaultSemiBold style when type is defaultSemiBold', () => {
    const { getByText } = render(<ThemedText type="defaultSemiBold">SemiBold Text</ThemedText>);
    
    // Check if the text is rendered
    const textElement = getByText('SemiBold Text');
    expect(textElement).toBeTruthy();
    
    // Check if the defaultSemiBold style is applied
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { color: '#000000' },
        expect.objectContaining({ fontSize: 16, lineHeight: 24, fontWeight: '600' }),
      ])
    );
  });

  it('renders with link style when type is link', () => {
    const { getByText } = render(<ThemedText type="link">Link Text</ThemedText>);
    
    // Check if the text is rendered
    const textElement = getByText('Link Text');
    expect(textElement).toBeTruthy();
    
    // Check if the link style is applied
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { color: '#000000' },
        expect.objectContaining({ fontSize: 16, lineHeight: 30, color: '#0a7ea4' }),
      ])
    );
  });

  it('applies custom style when provided', () => {
    const customStyle = { marginTop: 10, padding: 5 };
    const { getByText } = render(<ThemedText style={customStyle}>Custom Style Text</ThemedText>);
    
    // Check if the text is rendered
    const textElement = getByText('Custom Style Text');
    expect(textElement).toBeTruthy();
    
    // Check if the custom style is applied along with default styles
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { color: '#000000' },
        expect.objectContaining({ fontSize: 16, lineHeight: 24 }),
        customStyle,
      ])
    );
  });
});
