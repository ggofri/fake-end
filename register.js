const { register } = require('tsconfig-paths');
const { resolve } = require('path');

const baseUrl = resolve(__dirname, 'dist', 'src');
const paths = {
  "@/*": ["./*"],
  "@/types": ["./types/index"],
  "@/server/*": ["./server/*"],
  "@/constants": ["./constants/index"],
  "@/cli/*": ["./cli/*"],
  "@/utils": ["./utils/index"]
};

register({
  baseUrl,
  paths,
});
