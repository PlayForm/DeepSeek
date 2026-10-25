// The seventh normalize flavor: normalize-file. Only its two overpass arms
// are guarded (its Command is the unique files sweep). The guard records its
// own hashes; it never requires equality with the stream flavors - the file
// flavor's transform is the six-fold chain, not one table.
export default "file";
