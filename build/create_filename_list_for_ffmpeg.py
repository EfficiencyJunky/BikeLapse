from os.path import basename
from glob import glob
from os import system
import subprocess

# the extension to search for and its path
baseFolderPath = "../reference_info/TESTING_MODULES/ffmpeg_combine_videos/input/"
fileExtensionToSearchFor = "*.MOV"
pathOfExtensionToSearchFor = baseFolderPath + fileExtensionToSearchFor

# the name of the ".txt" file to use for the ffmpeg call
# it will store a list of the file names found with the path/extension specified above
filesTxtFilename = "files.txt"
filesTxtFilepath = baseFolderPath + filesTxtFilename


# We want to create a file with the names of the .MOV files from our ride
# The contents of the file should look something like this:
# file '01.MOV'
# file '02.MOV'

file_path_list = glob(pathOfExtensionToSearchFor)

# PRINT PRINT PRINT
# unsorted list of file paths to use
[print(filepath) for filepath in file_path_list]

file_name_list = [basename(filepath) for filepath in file_path_list]
file_name_list.sort()

mov_file_name_lines = ["file '" + filename + "'" for filename in file_name_list]
join_character = "\n"

# PRINT PRINT PRINT
# sorted list of file names to use in "files.txt" output
print(join_character.join(file_name_list))

# PRINT PRINT PRINT
# sorted list of text lines to write out to "files.txt"
[print(filepath) for filepath in mov_file_name_lines]

# write the text out to filesTxtFilepath (baseFolderPath + "files.txt")
f = open(filesTxtFilepath, "w")
f.write( join_character.join(mov_file_name_lines) )
f.close()

command = ["ffmpeg", "-f", "concat", "-i", "files.txt", "-c", "copy", "../output/output.mov"]

p = subprocess.Popen(command, cwd=baseFolderPath)
p.wait()




# OLD WAY OF DOING IT
# system('ffmpeg -f concat -i ./input/files.txt -c copy ./output/output.mov')