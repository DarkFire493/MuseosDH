json.extract! evento, :id, :nombre, :fecha, :descripcion, :created_at, :updated_at
json.url evento_url(evento, format: :json)
