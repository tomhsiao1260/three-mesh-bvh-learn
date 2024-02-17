// Build constants
export const BYTES_PER_NODE = 6 * 4 + 4 + 4;

// EPSILON for computing floating point error during build
// https://en.wikipedia.org/wiki/Machine_epsilon#Values_for_standard_hardware_floating_point_arithmetics
export const FLOAT32_EPSILON = Math.pow(2, -24);
