from setuptools import find_packages, setup

setup(
    name="evidentia",
    version="0.0.0",
    description="Agentic System for Temporal Retrieval and Verification of Vietnamese Legal Information",
    packages=find_packages(include=["backend"]),
    python_requires=">=3.10",
    install_requires=[],
)
