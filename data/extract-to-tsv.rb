# Extract just the data we want out of UnicodeData.txt

re = /\A(.*?);(.*?);.*\Z/

while (line = $stdin.gets)
  md = re.match(line)
  if md
    puts "#{md[1]}\t#{md[2]}"
  else
    raise "couldn't match: #{line}"
  end
end
