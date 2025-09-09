#!/usr/bin/env ruby
# -*- encoding: utf-8; -*-

require 'json'

if ARGV.empty?
  puts "Usage: gen_list.rb directory/"
  exit
end

puts (Dir.glob(File.join(ARGV.shift, "*.pmd")).sort_by{|v| v.downcase }.map do |filename|
  File.open(filename, "rb:Shift_JIS:UTF-8") do |file|
    part_num = file.getbyte
    part_num = file.getbyte if part_num == 0
    
    file_header = file.read((2*part_num) + 2 + 2 + 2)
    
    header = file_header.unpack("v#{part_num}vvv")
    
    title_offset = header[part_num + 1]
    title2_offset = header[part_num + 2]
    
    title = ""
    if title_offset != 0
      file.seek(title_offset)
      while (c = file.getc rescue "〓") && c != "\0" do
        title << c
      end
      title.gsub!(/;/, "\n")
    end    
    title2 = ""
    if title2_offset != 0
      file.seek(title2_offset)
      while (c = file.getc rescue "〓") && c != "\0" do
        title2 << c
      end
      title2.gsub!(/;/, "\n")
    end
    
    {
      "href" => filename, "filename" => File.basename(filename), 
      "name" => File.basename(filename, ".pmd"),
      "title" => title, "title2" => title2
    }
  end
end.to_json)


