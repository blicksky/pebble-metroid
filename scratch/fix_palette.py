import zlib
import struct

def fix_png_palette(filename):
    with open(filename, 'rb') as f:
        data = f.read()
        
    signature = data[:8]
    assert signature == b'\x89PNG\r\n\x1a\n'
    
    offset = 8
    output_data = bytearray(signature)
    
    while offset < len(data):
        length = struct.unpack('>I', data[offset:offset+4])[0]
        chunk_type = data[offset+4:offset+8]
        chunk_data = data[offset+8:offset+8+length]
        crc = data[offset+8+length:offset+12+length]
        
        if chunk_type == b'PLTE':
            print("Found PLTE chunk! Original data:", chunk_data.hex())
            # Replace colors:
            # \x28\x38\x88 (40, 56, 136) -> \x00\x00\xaa (0, 0, 170)
            # \xf8\xf8\xf8 (248, 248, 248) -> \xff\xff\xff (255, 255, 255)
            new_chunk_data = bytearray(chunk_data)
            
            # Replace outline blue
            idx1 = new_chunk_data.find(b'\x28\x38\x88')
            if idx1 != -1:
                new_chunk_data[idx1:idx1+3] = b'\x00\x00\xaa'
                print(f"Replaced outline blue at index {idx1}")
                
            # Replace white text
            idx2 = new_chunk_data.find(b'\xf8\xf8\xf8')
            if idx2 != -1:
                new_chunk_data[idx2:idx2+3] = b'\xff\xff\xff'
                print(f"Replaced white text at index {idx2}")
                
            new_chunk_data = bytes(new_chunk_data)
            new_crc = zlib.crc32(chunk_type + new_chunk_data) & 0xffffffff
            
            output_data.extend(struct.pack('>I', length))
            output_data.extend(chunk_type)
            output_data.extend(new_chunk_data)
            output_data.extend(struct.pack('>I', new_crc))
        else:
            output_data.extend(data[offset:offset+12+length])
            
        offset += 12 + length
        
    with open(filename, 'wb') as f:
        f.write(output_data)
    print("Palette fixed and saved successfully!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        fix_png_palette(sys.argv[1])
    else:
        print("Usage: python3 fix_palette.py <path_to_png>")
