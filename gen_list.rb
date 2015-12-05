#!/usr/bin/env ruby
# -*- encoding: utf-8; -*-

require 'json'

puts (Dir.glob("./pmd/*.pmd").sort_by{|v| v.downcase }.map do |filename|
  File.open(filename, "rb:Shift_JIS:UTF-8") do |file|
    part_num = file.getbyte
    part_num = file.getbyte if part_num == 0
    
    file_header = file.read(12 + 2 + 2 + 2)
    
    header = file_header.unpack("v6vvv")
    
    title_offset = header[7]
    title2_offset = header[8]
    
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
      "href" => filename, "name" => File.basename(filename, ".pmd"),
      "title" => title, "title2" => title2
    }
  end
end.to_json)


