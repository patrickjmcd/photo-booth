Vagrant.configure("2") do |config|
    config.vm.provider "docker" do |d|
      d.image = "python:3"
    end

  config.vm.synced_folder "src/", "/opt/photobooth"
end