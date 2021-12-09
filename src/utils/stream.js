function chunkByteStream(_byteStream){
    const FILE_PART_SIZE = 3000;
    let chunks = [];

    if (_byteStream.length <= FILE_PART_SIZE) {
        return {ttl_size: _byteStream.length, chunk_count: 1, remainder_bytes: 0, chunks: [_byteStream]}
    }

    const chunk_num = _byteStream.length/FILE_PART_SIZE;
    const remainder = _byteStream.length % FILE_PART_SIZE;
    let start_idx = 0;
    let end_idx = FILE_PART_SIZE;

    for (let i = 0; i < chunk_num; i++) {
        const chunk = _byteStream.slice(start_idx, end_idx);
        chunks.push(chunk);
        start_idx = end_idx;
        end_idx += FILE_PART_SIZE;
    }

    remainder > 0? chunks.push(_byteStream.slice(end_idx, end_idx + remainder)) : "";


    return {
        ttl_size: _byteStream.length,
        chunk_count: chunk_num,
        remainder_bytes: remainder,
        chunk_arr: chunks
    }
    
}

module.exports = {
    chunkByteStream: chunkByteStream
}