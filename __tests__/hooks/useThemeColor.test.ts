import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

// Mock the useColorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn()
}));

describe('useThemeColor', () => {
  const useColorSchemeMock = require('@/hooks/useColorScheme').useColorScheme;

  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  it('returns the color from props when available for light theme', () => {
    // Mock the useColorScheme hook to return 'light'
    useColorSchemeMock.mockReturnValue('light');

    // Call the hook with props that include a light color
    const props = { light: '#FF0000', dark: '#0000FF' };
    const result = useThemeColor(props, 'text');

    // Expect the result to be the light color from props
    expect(result).toBe('#FF0000');
  });

  it('returns the color from props when available for dark theme', () => {
    // Mock the useColorScheme hook to return 'dark'
    useColorSchemeMock.mockReturnValue('dark');

    // Call the hook with props that include a dark color
    const props = { light: '#FF0000', dark: '#0000FF' };
    const result = useThemeColor(props, 'text');

    // Expect the result to be the dark color from props
    expect(result).toBe('#0000FF');
  });

  it('returns the color from Colors when props color is not available for light theme', () => {
    // Mock the useColorScheme hook to return 'light'
    useColorSchemeMock.mockReturnValue('light');

    // Call the hook with empty props
    const props = {};
    const result = useThemeColor(props, 'text');

    // Expect the result to be the text color from Colors.light
    expect(result).toBe(Colors.light.text);
  });

  it('returns the color from Colors when props color is not available for dark theme', () => {
    // Mock the useColorScheme hook to return 'dark'
    useColorSchemeMock.mockReturnValue('dark');

    // Call the hook with empty props
    const props = {};
    const result = useThemeColor(props, 'text');

    // Expect the result to be the text color from Colors.dark
    expect(result).toBe(Colors.dark.text);
  });

  it('defaults to light theme when useColorScheme returns null', () => {
    // Mock the useColorScheme hook to return null
    useColorSchemeMock.mockReturnValue(null);

    // Call the hook with empty props
    const props = {};
    const result = useThemeColor(props, 'text');

    // Expect the result to be the text color from Colors.light
    expect(result).toBe(Colors.light.text);
  });
});
