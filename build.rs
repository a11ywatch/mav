fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("./src/proto/mav.proto")?;
    tonic_build::compile_protos("./src/proto/health.proto")?;

    Ok(())
}
