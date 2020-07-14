from os.path import basename
from glob import glob

filePathsToSearchFor = "./static/data/*.json"
outputFilepath = "./static/config/all_ride_file_names.js"

# We want to create a file with the names of the JSON files that have the information on all the rides we want to display
# The contents of the file should look something like this:
# let bikeRideJSONFileNames = [
#     "2020_06_21--crystalsprings.json",
#     "2020_07_05--rodeobeach.json",
#     "2020_07_15--paradiseloop.json",
#     "2020_07_11--ingleside.json"
#   ]

# print(glob.glob("../../static/data/*.json"))

file_path_list = glob(filePathsToSearchFor)

# [print(filepath) for filepath in file_path_list]

file_name_list = [basename(filepath) for filepath in file_path_list]
file_name_list.sort()

# print("List of file names to write out")
# [print(filename) for filename in file_name_list]

f = open(outputFilepath, "w")
f.write("let bikeRideJSONFileNames = " + str(file_name_list))
f.close()