from os.path import basename
from glob import glob

filePathsToSearchFor = "./data/*.json"
outputFilepath = "./js/config/all_ride_file_names.js"
join_character = '",\n        "'
# We want to create a file with the names of the JSON files that have the information on all the rides we want to display
# The contents of the file should look something like this:
# let bikeRideJSONFileNames = [
#     "2020_06_21--crystalsprings.json",
#     "2020_07_05--rodeobeach.json",
#     "2020_07_15--paradiseloop.json",
#     "2020_07_11--ingleside.json"
#   ]

# print(glob.glob("../../data/*.json"))

file_path_list = glob(filePathsToSearchFor)

# [print(filepath) for filepath in file_path_list]

file_name_list = [basename(filepath) for filepath in file_path_list]
file_name_list.sort()

formatted_file_name_list = join_character.join(file_name_list)

# print("List of file names to write out")
# [print(filename) for filename in file_name_list]

f = open(outputFilepath, "w")
f.write('let bikeRideJSONFileNames = [\n        "' + formatted_file_name_list + '"\n]')
f.close()