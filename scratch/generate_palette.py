def generate_gpl():
    levels = [0, 85, 170, 255]
    
    lines = [
        "GIMP Palette",
        "Name: Pebble GColor8",
        "Columns: 8",
        "#"
    ]
    
    for r in levels:
        for g in levels:
            for b in levels:
                hex_color = f"#{r:02X}{g:02X}{b:02X}"
                # Format: R G B Name (separated by tabs/spaces)
                lines.append(f"{r:3d} {g:3d} {b:3d}\t{hex_color}")
                
    with open("pebble_gcolor8.gpl", "w") as f:
        f.write("\n".join(lines) + "\n")
    print("Generated pebble_gcolor8.gpl successfully!")

if __name__ == "__main__":
    generate_gpl()
