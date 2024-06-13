// theme.js
import { extendTheme } from '@chakra-ui/react';

const CustomTheme = extendTheme({
    components: {
        Tabs: {
            baseStyle: {
                tab: {
                    _selected: {
                        color: '#3B43F0',
                        borderColor: '#3B43F0',
                    },
                },
                tablist: {
                    borderColor: '#3B43F0',
                },
                tabpanel: {
                    color: '#3B43F0',
                },
            },
            variants: {
                enclosed: {
                    tab: {
                        _selected: {
                            color: '#3B43F0',
                            borderBottomColor: '#3B43F0',
                        },
                    },
                },
                'enclosed-colored': {
                    tab: {
                        _selected: {
                            bg: '#3B43F0',
                            color: 'white',
                        },
                    },
                },
            },
        },
    },
});

export default CustomTheme;
