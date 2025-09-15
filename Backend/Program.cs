using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// --- Carga variables de entorno desde .env ---
DotNetEnv.Env.Load();

// --- Configuración de Servicios ---
// 1. Contexto de la base de datos (PostgreSQL con Supabase)
//var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// DEBUG: Verifica qué valor tiene la connection string
var connectionStringFromEnv = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
Console.WriteLine($"Desde .env: {connectionStringFromEnv}");

var connectionStringFromConfig = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Desde Configuración: {connectionStringFromConfig}");

// Usa explícitamente la variable de entorno si está disponible
var connectionString = !string.IsNullOrEmpty(connectionStringFromEnv)
    ? connectionStringFromEnv
    : connectionStringFromConfig;

Console.WriteLine($"Cadena final: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configura CORS (Frontend-Backend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500")  // Ajusta según el puerto de tu frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 3. Controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. Autenticación JWT (Supabase) - SIMPLIFICADA
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Solo para desarrollo
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = false, // Simplificado para testing
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// --- Construye la App ---
var app = builder.Build();

// Middlewares
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


/*
Cuidado,  siempre debe tener este orden:

UseHttpsRedirection()

UseCors() ← ¡ANTES de Authentication!

UseAuthentication() ← ¡ANTES de Authorization!

UseAuthorization()

MapControllers()
*/


app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();